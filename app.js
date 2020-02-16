var budgetController = (function() {
  // x and add are private
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  };
  return {
    addItem: function(type, des, val) {
      var newItem;
      var ID = 0;
      ID =
        data.allItems[type].length === 0
          ? 0
          : data.allItems[type][data.allItems[type].length - 1].id + 1;

      type === "exp"
        ? (newItem = new Expense(ID, des, val))
        : (newItem = new Income(ID, des, val));

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id) {
      var index;
      index = data.allItems[type]
        .map(x => {
          return x.id;
        })
        .indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      //  calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(curr) {
        curr.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      return data.allItems.exp.map(item => {
        return item.getPercentage();
      });
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();
var UIController = (function() {
  DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  var formatNumber = function(type, num) {
    // + or - based on type, 2 decimal points
    // comma after at 1000
    // 2220.47778 -> 2,220.48
    // 2000 -> 2,000.00
    return (
      (type === "inc" ? "+" : "-") +
      num.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
      })
    );
  };
  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //  add 0r exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Creat html string with placeholder text

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(type, obj.value));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function(selectorId) {
      var el;

      el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(curr, index, array) {
        curr.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget >= 0 ? "inc" : "exp",
        obj.budget
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        "inc",
        obj.totalInc
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber("exp", obj.totalExp);
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function(percentages) {
      // .item__percentage
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(curr, i) {
        curr.textContent = percentages[i] > 0 ? percentages[i] + "%" : "---";
      });
    },
    displayMonth: function() {
      var now, year, month, months;
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    changeType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          ", " +
          DOMstrings.inputDescription +
          ", " +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function(curr) {
        curr.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    getDOMStrings: function() {
      return DOMstrings;
    }
  };
})();

var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changeType);
  };

  var updateBudget = function() {
    //   1 calculate the budget
    budgetCtrl.calculateBudget();
    // 2. return teh budget
    var budget = budgetCtrl.getBudget();
    // 3 Display the budget
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    //   calculate Percentages
    budgetCtrl.calculatePercentages();
    var percentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(percentages);

    // update UI with teh percentages
  };
  //    controll and delegate
  var ctrlAddItem = function() {
    var input, newItem;
    // 1 Get the filled input DataTransfer
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2 Add teh item to the budgetcontroller
      var newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      // 3 Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4.clear fields
      UICtrl.clearFields();
      // 5 Calculate and update the budget
      updateBudget();
      updatePercentages();
    }
  };
  var ctrlDeleteItem = function(event) {
    var itemId, splitId, type, id;

    //  hardcoding the dom structure is not the best practice

    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      id = parseInt(splitId[1]);
      //   delete row from data
      budgetCtrl.deleteItem(type, id);
      // remove row from display
      UICtrl.deleteListItem(itemId);
      // update budget
      updateBudget();
      updatePercentages();
    }
  };
  return {
    init: function() {
      console.log("Application has started.");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
