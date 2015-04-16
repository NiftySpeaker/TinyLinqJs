var tinylinq = tinylinq || {};

(function () {

    //#region Private Helpers

    function _err(message) {
        throw new Error(message);
    }

    var trim = function (source) {
        return source.trim ? source.trim() : source.replace(/^\s+|\s+$/g, '');
    }

    var arrayForEach = function (array, handler) {
        for (var i = 0, j = array.length; i < j; i++)
            handler(array[i]);
    };

    //#endregion

    //#region Lambda Handlers and Type Validation

    var _lastLambdaAsString = null;
    var _lastLambdaFunc = null;

    tinylinq.Func = function (lambdaAsString) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="lambdaAsString" type="String"></param>
        /// <returns type="Function"></returns>

        if (lambdaAsString == _lastLambdaAsString) {
            return _lastLambdaFunc;
        }

        if (!lambdaAsString && lambdaAsString != 0) {
            _err(strArgumentNullException + "lambdaAsString");
        }

        if (typeof(lambdaAsString) != "string") {
            _err(strTypeLoadException + "lambdaAsString is not a string");
        }

        //split at goes-to sign
        var expressions = lambdaAsString.split("=>");
        if (expressions.length < 2) {
            _err("FormatException: No goes-to-sign (=>) found in lambda string");
        }
        var paramSection = trim(expressions[0]);    //Trim ever time
        var parameters = [];

        //handle brackets is neccessary
        if (paramSection.substr(0, 1) == "(") {
            //Check closing bracket in left side expression
            var i = paramSection.indexOf(")");
            if (i < 0) {
                _err("FormatException: No closing bracket was provided for lambda arguments");
            }
            //Check if closing bracket is last character of left side
            if (i != paramSection.length - 1) {
                _err("FormatException: Closing bracket must be the last character in lambda arguments section");
            }
            //extracting the paramSection without brackets
            paramSection = trim(paramSection.substr(1, paramSection.length - 2));
            //spilt the paramSection in single parameters
            parameters = paramSection.split(",");
            //trim all parameter names
            arrayForEach(parameters, function (parameter) {
                parameter = trim(parameter);
            });
        }
        else {
            //no brackets found -> single argument -> no commas allowed
            if (paramSection.indexOf(",") > -1) {
                _err("FormatException: For multiple parameters in a lambda expression, use brackets");
            }
            parameters.push(paramSection);
        }

        //build function body
        var hasReturn = (expressions[1].indexOf("return ") > -1);
        var funcBody = hasReturn ? expressions[1] : "return (" + expressions[1] + ");";
        var func;
        //Create the function on-the-fly
        switch (parameters.length) {
            case 1:
                func = new Function(parameters[0], funcBody);
                break;
            case 2:
                func = new Function(parameters[0], parameters[1], funcBody);
                break;
            case 3:
                func = new Function(parameters[0], parameters[1], parameters[2], funcBody);
                break;
            case 4:
                func = new Function(parameters[0], parameters[1], parameters[2], parameters[3], funcBody);
                break;
            case 5:
                func = new Function(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], funcBody);
                break;
            default:
                _err("ArgumentOutOfRangeException: Unsupported number of arguments in lambda expresson");
        }

        _lastLambdaAsString = lambdaAsString;
        _lastLambdaFunc = func;
        return (func);
    }

    tinylinq.FuncOf = function (T1, T2, T3, T4, T5, T6) {
        //check the types if possible
        var typeCheckers = [];
        if (T1)       { typeCheckers.push({ type: T1, validator: tinylinq.typeEvaluators[T1] }); }
        if (T1 && T2) { typeCheckers.push({ type: T2, validator: tinylinq.typeValidators[T2] }); }
        if (T2 && T3) { typeCheckers.push({ type: T3, validator: tinylinq.typeValidators[T3] }); }
        if (T3 && T4) { typeCheckers.push({ type: T4, validator: tinylinq.typeValidators[T4] }); }
        if (T4 && T5) { typeCheckers.push({ type: T5, validator: tinylinq.typeValidators[T5] }); }
        if (T5 && T6) { typeCheckers.push({ type: T6, validator: tinylinq.typeValidators[T6] }); }

        var Func = function (lambdaAsString) {
            var func = tinylinq.Func(lambdaAsString);

            var newFunc = function (p1, p2, p3, p4, p5) {
                var params = [p1, p2, p3, p4, p5];
                var errorMessage = " is of type TYPE, but should be of type ";

                var i;
                for (i = 0; i < typeCheckers.length - 1; i++) {
                    if (!typeCheckers[i].validator(params[i])) {
                        _err("InvalidCastException: Argument " + (i + 1) + errorMessage.replace(/TYPE/g, typeof (params[i])) + typeCheckers[i].type);
                    }
                }

                if (params[i]) {
                    _err("ArgumentException: Not enough types in FuncOf specified for parameter and result types");
                }

                var result = func(p1, p2, p3, p4, p5);

                if (!typeCheckers[typeCheckers.length - 1].validator(result)) {
                    _err("InvalidCastException: The result is of type " + typeof (result) + ", but should be of type " + typeCheckers[i].type + "!");
                }

                return result;
            }

            return newFunc;
        }

        return Func;
    }

    if (!tinylinq.typeValidators) {
        //Default typeValidators are not registered yet -> register them
        tinylinq.typeValidators = {
            "string": function (x) {
                return (typeof (x) == "string");
            },
            "int": function (x) {
                return (typeof (x) == "number" && parseInt(x) == parseFloat(x));
            },
            "float": function (x) {
                return (typeof (x) == "number");
            },
            "object": function (x) {
                return (typeof (x) == "object" && !Array.isArray(x)); //Javascript treats arrays as objects
            },
            "array": function (x) {
                return Array.isArray(x);
            },
            "function": function (x) {
                return (typeof (x) == "function");
            },
            "bool": function (x) {
                return (typeof (x) == "boolean");
            }
        }
    }

    //#endregion

    return tinylinq;
})();