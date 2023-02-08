function Validator(options) {
  var form = document.querySelector(options.form);
  var selectorRules = {};

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  function Validation(input, rule) {
    var inputContainer = getParent(input, options.form_group);
    var errorContainer = inputContainer.querySelector(options.message);
    var rules = selectorRules[rule.selector];

    for (var i = 0; i < rules.length; i++) {
      switch (input.type) {
        case "checkbox":
        case "radio":
          var errorMessage = rules[i](
            form.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          var errorMessage = rules[i](input.value);
      }
      if (errorMessage) {
        break;
      }
    }

    if (errorMessage) {
      inputContainer.classList.add("invalid");
      errorContainer.innerText = errorMessage;
    } else {
      inputContainer.classList.remove("invalid");
      errorContainer.innerText = "";
    }

    return !errorMessage;
  }

  if (form) {
    options.rules.forEach((rule) => {
      var inputs = form.querySelectorAll(rule.selector);

      Array.from(inputs).forEach((input) => {
        input.onblur = () => {
          Validation(input, rule);
        };

        input.oninput = () => {
          var inputContainer = getParent(input, options.form_group);
          var errorContainer = inputContainer.querySelector(options.message);
          inputContainer.classList.remove("invalid");
          errorContainer.innerText = "";
        };
      });

      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }
    });
  }

  form.onsubmit = (e) => {
    e.preventDefault();

    var isFormValid = true;

    options.rules.forEach((rule) => {
      var input = form.querySelector(rule.selector);
      var isValid = Validation(input, rule);
      if (!isValid) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      var data = {};

      if (typeof options.onSubmit === "function") {
        var allInputs = document.querySelectorAll(
          "[name]:not(#password-confirm)"
        );
        for (var i = 0; i < allInputs.length; i++) {
          switch (allInputs[i].type) {
            case "checkbox":
              if (allInputs[i].matches(":checked")) {
                if (Array.isArray(data[allInputs[i].name])) {
                  data[allInputs[i].name].push(allInputs[i].value);
                } else {
                  data[allInputs[i].name] = [allInputs[i].value];
                }
              }
              break;

            case "radio":
              if (allInputs[i].matches(":checked")) {
                data[allInputs[i].name] = allInputs[i].value;
              }
              break;

            case "file":
              data[allInputs[i].name] = allInputs[i].files;
              break;

            default:
              data[allInputs[i].name] = allInputs[i].value;
          }
        }
        options.onSubmit(data);
      } else {
        form.submit();
      }
    }
  };
}

Validator.isRequired = (selector, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value ? undefined : message || "Please fill out this field";
    },
  };
};

Validator.isEmail = (selector, message) => {
  return {
    selector: selector,
    test: (value) => {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "Please enter your email address";
    },
  };
};

Validator.isMinLength = (selector, min, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value.length >= min
        ? undefined
        : message || `It must be at least ${min} characters`;
    },
  };
};

Validator.isConfirmed = (selector, getConfirmValue, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value === getConfirmValue()
        ? undefined
        : message || "Please re-enter this field";
    },
  };
};
