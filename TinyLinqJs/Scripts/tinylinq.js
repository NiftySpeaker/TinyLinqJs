var tinylinq = tinylinq || {};

(function () {
    var strUndefined = 'undefined';
    var strFunction = "function";
    var strInvalidOperationException = "InvalidOperationException: ";
    var strTypeLoadException = "TypeLoadException: ";
    var strSequenceContains = "The sequence contains ";
    var strInvalidOperationExceptionMoreThanOne = strInvalidOperationException + strSequenceContains + "more than one element";
    var strArgument = "Argument ";
    var strPredicate = "predicate";
    var strSelector = "selector";
    var strResultSelector = "resultSelector";
    var strSecond = "second";
    var strKeySelector = "keySelector";
    var strCount = "count";

    //#region Private Check Methods

    function _err(message) {
        throw new Error(message);
    }

    var checkMissingArgument = function (argument, typeString) {
        if (!argument && argument != 0) {
            _err("ArgumentNullException: Missing " + typeString);
        }
    }

    var checkEmptyArray = function (array) {
        if (unwrap(array).length == 0) {
            _err(strInvalidOperationException + strSequenceContains + "no elements");
        }
    };

    var checkIfArray = function (argument, typeString) {
        if (!Array.isArray(argument)) {
            _err(strTypeLoadException + strArgument + typeString + " is not an array");
        }
    }

    var checkIfInteger = function (index, typeString) {
        if (isNaN(index) || parseInt(index) != parseFloat(index)) {
            _err(strTypeLoadException + strArgument + typeString + " is not an int");
        }
    }

    var checkEmptyMatching = function (result) {
        if (!result) {
            _err(strInvalidOperationException + strSequenceContains + "no matching element");
        }
    };

    var checkIfFunction = function (argument, typeString) {
        argument = checkIfLambda(argument);
        if (typeof (argument) != strFunction ) {
            _err(strTypeLoadException + strArgument + typeString + " is not a function");
        }
        return argument;
    }

    var checkIfLambda = function (argument) {
        if (typeof (argument) == "string" && argument.indexOf("=>") > 0 && tinylinq.Func) {
            //Lambda Extension is installed
            argument = tinylinq.Func(argument);
        }
        return argument;
    }

    //#endregion

    //#region Private Ensure Methods

    var ensurePredicateIsFunction = function (predicate) {
        return checkIfFunction(predicate, strPredicate);
    }

    var ensureResultSelectorIsFunction = function (selector) {
        if (selector) {
            return checkIfFunction(selector, strResultSelector);
        }
        return selector;
    }

    var ensureEqualityComparerIsFunction = function (comparer) {
        if (comparer) {
            checkIfFunction(comparer, "comparer");
        }
    }

    var ensureElementSelectorIsFunction = function (selector) {
        if (selector) {
            return checkIfFunction(selector, "elementSelector");
        }
        return selector;
    }

    var ensureSecondIsArray = function (second) {
        var a = unwrap(second);
        checkIfArray(a, strSecond);
        return a;
    }

    var detectEqualityComparer = function (comparer) {
        return comparer || function (key1, key2) {
            return key1 === key2;
        }
    }

    var defaultMultiKeyComparer = function () {
        return function (key1, key2) {
            //TrickyPOI: Checking equality of Json objects
            return JSON.stringify(key1) === JSON.stringify(key2);
        }
    }

    var checkJoinArguments = function (arguments) {
        var inKey = "inner";
        var outKeySel = "outerKeySelector";
        var inKeySel = "innerKeySelector";
        checkMissingArgument(arguments.i, inKey);
        checkMissingArgument(arguments.oks, outKeySel);
        checkMissingArgument(arguments.iks, inKeySel);
        checkMissingArgument(arguments.rs, strResultSelector);
        checkIfArray(unwrap(arguments.i), inKey);
        arguments.oks = checkIfFunction(arguments.oks, outKeySel);
        arguments.iks = checkIfFunction(arguments.iks, inKeySel);
        arguments.rs = ensureResultSelectorIsFunction(arguments.rs);
        return arguments;
    }

    //#endregion

    
    //#region A

    function Aggregate(seedOrFunc, func, resultSelector) {
        var sofKey = "seedOrFunc";
        checkMissingArgument(seedOrFunc, sofKey);

        var original = unwrap(this);
        var result = null;
        var theFunc;
        var startIndex = 0;
        if (!func && !resultSelector) {
            //Only one argument, so seedOrFunc must be a function and the sequence can not be null
            theFunc = seedOrFunc;
            checkEmptyArray(this);
            theFunc = checkIfFunction(theFunc, sofKey);

            result = original[0];
            startIndex = 1;
        }
        else {
            //More than one argument, so the func parameter must be a function
            if (typeof seedOrFunc == strFunction || typeof checkIfLambda(seedOrFunc) == strFunction) {
                _err(strTypeLoadException + strArgument + sofKey + " can not be a function in this overload");
            }
            theFunc = checkIfFunction(func, "func");
            result = seedOrFunc;
        }

        //Loop through the elements and perform theFunc
        for (var i = startIndex; i < original.length; i++) {
            result = theFunc(result, original[i]);
        }

        if (resultSelector) {
            result = ensureResultSelectorIsFunction(resultSelector)(result);
        }

        return result;
    }

    function All(predicate) {
        checkMissingArgument(predicate, strPredicate);
        predicate = ensurePredicateIsFunction(predicate);

        var hit = arrayFirst(unwrap(this), function (item) {
            return !predicate(item);
        });

        return hit == null;
    }

    function Any(predicate) {
        var p = predicate;
        if (!p) {
            return unwrap(this).length > 0;
        }

        p = ensurePredicateIsFunction(p);
        var hit = arrayFirst(unwrap(this), function (item) {
            return p(item);
        });

        return hit != null;
    }

    function Average(selector) {
        checkMissingArgument(selector, strSelector);
        checkEmptyArray(this);
        selector = checkIfLambda(selector);
        var sum = this.Sum(selector);
        return sum / unwrap(this).length;
    }

    //#endregion

    //#region C

    function Concat(second) {
        checkMissingArgument(second, strSecond);
        var secondArray = ensureSecondIsArray(second);

        var original = unwrap(this);
        var result = [];
        if (original.length > 0) {
            result = mapWholeArray(original);
        }

        if (secondArray.length > 0) {
            if (result == null) {
                result = secondArray;
            } else {
                arrayPushAll(result, secondArray);
            }
        }
        return result;
    }

    function Contains(item, comparer) {
        //item can be null
        var original = unwrap(this);
        if (original.length == 0) {
            return false;
        }

        //Set the equalityComparer
        ensureEqualityComparerIsFunction(comparer);
        var equalComp = detectEqualityComparer(comparer);

        for (var i = 0; i < original.length; i++) {
            if (equalComp(original[i], item)) {
                return true;
            }
        }
        return false;
    }

    function Count(predicate) {
        var original = unwrap(this);

        if (predicate) {
            predicate = ensurePredicateIsFunction(predicate);
            return arrayFilter(original, predicate).length;
        }
        return original.length;
    }

    //#endregion

    //#region D

    function DefaultIfEmpty(defaultValue) {
        var original = unwrap(this);
        if (original.length > 0) {
            return mapWholeArray(original);
        }

        return [defaultValue || null];
    }

    function Distinct(comparer) {
        var original = unwrap(this);
        if (!original.length) {
            return [];
        }

        //Set the equalityComparer
        ensureEqualityComparerIsFunction(comparer);
        var equalComp = detectEqualityComparer(comparer);

        var result = [];
        arrayForEach(original, function (item) {
            var foundItem = arrayFirst(result, function (element) {
                return equalComp(element, item);
            });
            if (!foundItem) {
                result.push(item);
            }
        });

        return result;
    }

    //#endregion

    //#region E

    function ElementAtOrDefault(index) {
        checkMissingArgument(index, "index");
        checkIfInteger(index, "index");

        var original = unwrap(this);
        if (parseInt(index) > original.length - 1) {
            return null;
        }
        return original[index];
    }

    function ElementAt(index) {
        var result = this.ElementAtOrDefault(index);
        if (!result) {
            _err("ArgumentOutOfRangeException: The index was out of range.");
        }
        return result;
    }

    var _ExceptIntersectCore = function (isIntersect, first, second, comparer) {
        checkMissingArgument(second, strSecond);
        var secondArray = ensureSecondIsArray(second);

        var original = unwrap(first);
        if (!original.length || !secondArray.length) {
            //Different returns for Except and Intersect
            return isIntersect ? [] : mapWholeArray(unwrap(first));
        }

        var result = [];
        for (var i = 0; i < original.length; i++) {
            //bool decides what to do
            if (second.Contains(original[i], comparer) == isIntersect) {
                result.push(original[i]);
            }
        }
        return wrap(result).Distinct(comparer);
    }

    function Except(second, comparer) {
        return _ExceptIntersectCore(false, this, second, comparer);
    }

    //#endregion

    //#region F

    function FirstOrDefault(predicate) {
        var original = unwrap(this);

        if (!original.length) {
            return null;
        }

        if (!predicate) {
            return original[0];
        }

        return arrayFirst(original, ensurePredicateIsFunction(predicate));
    }

    function First(predicate) {
        checkEmptyArray(this);
        var result = this.FirstOrDefault(predicate);

        checkEmptyMatching(result)
        return result;
    }

    //#endregion

    //#region G

    var _GroupByCore = function (original, keySelector, elementSelector, resultSelector, comparer) {
        keySelector = checkIfFunction(keySelector, strKeySelector);
        ensureEqualityComparerIsFunction(comparer);

        if (!original.length) {
            return [];
        }

        //Set the elementSelector and the equalityComparer
        var elemSelect = elementSelector || function (item) { return item; };
        var equalComp = detectEqualityComparer(comparer);

        var result = [];
        arrayForEach(original, function (item) {
            var key = keySelector(item);
            //Look for existing group with key
            var targetGroup = arrayFirst(result, function (group) {
                return equalComp(group.Key, key);
            });

            if (!targetGroup) {
                //No Group found => Create a new group and add the item 
                targetGroup = [];
                targetGroup.Key = key;
                result.push(targetGroup); //Wrap group to make Linq available in knockout
            }
            targetGroup.push(elemSelect(item));
        });

        if (resultSelector) {
            var rs = ensureResultSelectorIsFunction(resultSelector);
            result = arrayMap(result, function (group) {
                return rs(unwrap(group).Key, group);
            });
        }
        return result;
    };

    function GroupBy(keySelector, elementSelector, resultSelector, comparer) {
        checkMissingArgument(keySelector, strKeySelector);
        
        return _GroupByCore(unwrap(this), keySelector, ensureElementSelectorIsFunction(elementSelector), resultSelector, comparer);
    };

    function GroupJoin(inner, outerKeySelector, innerKeySelector, resultSelector, comparer) {
        var args = {
            i: inner,
            oks: outerKeySelector,
            iks: innerKeySelector,
            rs: resultSelector
        };
        args = checkJoinArguments(args);

        if (unwrap(this).length == 0 || unwrap(args.i).length == 0) {
            return [];
        }

        //Set the equalityComparer
        var equalComp = comparer || defaultMultiKeyComparer();

        var groups = _GroupByCore(unwrap(args.i), args.iks, null, null, equalComp);

        var result = [];
        arrayForEach(unwrap(this), function (outer) {
            var hits = _WhereCore(groups, function (i) {
                return equalComp(args.oks(outer), i.Key);
            }).SingleOrDefault();
            if (hits) {
                result.push(args.rs(outer, hits));
            };
        });
        return result;
    }

    //#endregion

    //#region I

    function Intersect(second, comparer) {
        return _ExceptIntersectCore(true, this, second, comparer);
    }

    //#endregion

    //#region J
    function Join(inner, outerKeySelector, innerKeySelector, resultSelector, comparer) {
        var args = {
            i: inner,
            oks: outerKeySelector,
            iks: innerKeySelector,
            rs: resultSelector
        };
        args = checkJoinArguments(args);

        //Set the equalityComparer
        var equalComp = comparer || defaultMultiKeyComparer();

        var groups = _GroupByCore(unwrap(args.i), args.iks, null, null, equalComp);

        var result = [];
        arrayForEach(unwrap(this), function (outer) {
            var hits = _WhereCore(groups, function (i) {
                return equalComp(args.oks(outer), i.Key);
            })
            .SelectMany(function (right) {
                return right;
            });
            arrayForEach(unwrap(hits), function (inner) {
                result.push(args.rs(outer, inner));
            });
        });
        return result;
    }
    //#endregion

    //#region L

    function LastOrDefault(predicate) {
        var original = unwrap(this);

        if (original.length == 0) {
            return null;
        }

        if (!predicate) {
            return original[original.length - 1];
        }

        ensurePredicateIsFunction(predicate);
        for (var i = original.length - 1; i >= 0; i--) {
            if (predicate(original[i])) {
                return original[i];
            }
        }

        return null;
    }

    function Last(predicate) {
        checkEmptyArray(this);

        var result = this.LastOrDefault(predicate);
        checkEmptyMatching(result);
        return result;
    }

    function LongCount(predicate) {
        return this.Count(predicate);
    }

    //#endregion

    //#region M

    var _minMaxCore = function (original, selector, isMin) {
        checkMissingArgument(selector, strSelector);
        checkEmptyArray(original);
        checkIfFunction(selector, strSelector);

        var result = !isMin ? -2147483648 : 2147483648;
        arrayForEach(unwrap(original), function (item) {
            var value = selector(item);
            if ((isMin && value < result) || (!isMin && value > result)) {
                result = value;
            }
        });
        return result;
    }

    function Max(selector) {
        return _minMaxCore(this, selector, false);
    }

    function Min(selector) {
        return _minMaxCore(this, selector, true);
    }

    //#endregion

    //#region O

    function OfType(TResult) {
        checkMissingArgument(TResult, "TResult");

        if (!tinylinq.typeValidators[TResult]) {
            _err(strTypeLoadException + strArgument + "TResult is an unknown type. Please extend the tinylinq.typeValidators!");
        }

        var result = _WhereCore(unwrap(this), function (item) {
            return tinylinq.typeValidators[TResult](item);
        });
        return unwrap(result);
    }

    var _defaultComparer = function (x, y, asc) {
        if (x < y)
            return asc ? -1 : 1;
        if (x > y)
            return asc ? 1 : -1;
        return 0
    }

    var _orderByCore = function (original, keySelector, comparer, asc) {
        var ks = keySelector;
        checkMissingArgument(ks, strKeySelector);
        ks = checkIfFunction(ks, strKeySelector);

        var result = [];

        //Set the comparer
        var comp = comparer || _defaultComparer;

        //Clone original
        var result = mapWholeArray(original);

        //Use default sort method of Javascript array
        result.sort(function (x, y) {
            return comp(ks(x), ks(y), asc);
        });
        
        result.SortKeys = [{
            key: ks,
            dir: asc ? "asc" : "desc",
            comp: comp
        }];
        return result;
    }
    
    function OrderBy(keySelector, comparer) {
        return _orderByCore(unwrap(this), keySelector, comparer, true);
    }

    function OrderByDescending(keySelector, comparer) {
        return _orderByCore(unwrap(this), keySelector, comparer, false);
    }

    //#endregion

    //#region R

    function Reverse() {
        var result = mapWholeArray(unwrap(this));
        return result.reverse();
    }

    //#endregion

    //#region S

    function Select(selector) {
        if (!selector) {
            return mapWholeArray(unwrap(this));
        }
        selector = checkIfFunction(selector, strSelector);

        var i = -1;
        var result = arrayMap(unwrap(this), function (item) {
            return selector(item, ++i);
        });
        return result;
    }

    function SelectMany(collectionsSelector, resultSelector) {
        var colSelKey = "collectionsSelector";
        checkMissingArgument(collectionsSelector, colSelKey);
        collectionsSelector = checkIfFunction(collectionsSelector, colSelKey);

        var result = [];
        var i = 0;
        arrayForEach(unwrap(this), function (item) {
            var subArray = unwrap(collectionsSelector(item, i));
            if (!Array.isArray(subArray)) {
                _err(strTypeLoadException + "The " + colSelKey + " does not return an array");
            }

            resultSelector = ensureResultSelectorIsFunction(resultSelector);

            arrayForEach(subArray, function (subItem) {
                var value = resultSelector ? resultSelector(item, subItem) : subItem;
                result.push(value);
            });

            i++;
        });
        return result;
    }

    function SequenceEqual(second, comparer) {
        checkMissingArgument(second, strSecond);
        ensureEqualityComparerIsFunction(comparer);

        var original = unwrap(this);
        var secondArray = unwrap(second);

        if (original.length != secondArray.length) {
            return false;
        }

        if (original === secondArray) {
            return true;
        }

        var equalComp = detectEqualityComparer(comparer);

        for (var i = 0; i < original.length; i++) {
            if (!equalComp(original[i], secondArray[i])) {
                return false;
            }
        }
        return true;
    }

    function SingleOrDefault(predicate) {
        var original = unwrap(this);
        var result = null;

        if (!predicate) {
            switch (original.length) {
                case 0:
                    return null;
                case 1:
                    return original[0];
                default:
                    _err(strInvalidOperationExceptionMoreThanOne);
            }
        }

        predicate = ensurePredicateIsFunction(predicate);
        arrayForEach(original, function (item) {
            if (predicate(item)) {
                if (result != null) {
                    _err(strInvalidOperationExceptionMoreThanOne);
                }
                result = item;
            }
        });

        return result;
    };

    function Single(predicate) {
        var originalArray = this;
        var foundElement = originalArray.SingleOrDefault(predicate)

        checkEmptyMatching(foundElement);

        return foundElement;
    };

    function Skip(count) {
        checkMissingArgument(count, strCount);
        checkIfInteger(count, strCount);

        if (count <= 0) { return mapWholeArray(unwrap(this)); }

        var original = unwrap(this);
        if (count >= original.length) { return []; }

        var result = [];
        for (var i = count; i < original.length; i++) {
            result.push(original[i]);
        }

        return result;
    }

    function SkipWhile(predicate) {
        checkMissingArgument(predicate, strPredicate);
        predicate = ensurePredicateIsFunction(predicate);

        var result = [];
        var original = unwrap(this);
        var continueSkip = true;
        for (var i = 0; i < original.length; i++) {
            if (continueSkip) {
                continueSkip = predicate(original[i], i);
            }
            if (!continueSkip) {
                result.push(original[i]);
            }
        }

        return result;
    }

    function Sum(selector) {
        checkMissingArgument(selector, strSelector);
        selector = checkIfFunction(selector, strSelector);

        var original = unwrap(this);
        if (original.length == 0) { return 0 }

        var sum = 0;
        arrayForEach(original, function (item) {
            sum += selector(item);
        });
        return sum;
    }

    //#endregion

    //#region T

    function Take(count) {
        checkMissingArgument(count, strCount);
        checkIfInteger(count, strCount);

        var original = unwrap(this);
        if (count >= original.length) { return mapWholeArray(original); }

        var result = [];
        for (var i = 0; i < count; i++) {
            result.push(original[i]);
        }

        return result;
    }

    function TakeWhile(predicate) {
        checkMissingArgument(predicate, strPredicate);
        predicate = ensurePredicateIsFunction(predicate);

        var result = [];
        var original = unwrap(this);
        for (var i = 0; i < original.length; i++) {
            if (!predicate(original[i], i)) {
                break;
            }
            result.push(original[i]);
        }

        return result;
    }

    var _thenByRecursive = function (observableArray, keySelector, comparer, sortKeys, sortKeyIndex, asc) {
        var tmp = wrap(_GroupByCore(unwrap(observableArray), sortKeys[sortKeyIndex].key));

        var result = [];
        arrayForEach(unwrap(tmp), function (group) {
            var current;
            if (sortKeyIndex < sortKeys.length - 1 ) {
                current = _thenByRecursive(wrap(group), keySelector, comparer, sortKeys, sortKeyIndex + 1, asc);
            }
            else {
                if (asc) 
                    current = wrap(group).OrderBy(keySelector, comparer);
                else 
                    current = wrap(group).OrderByDescending(keySelector, comparer);
            }
            arrayPushAll(result, unwrap(current));
        });

        return result;
    }

    var _thenByCore = function (array, keySelector, comparer, asc) {
        if (!array.SortKeys) {
            _err(strInvalidOperationException + "ThenBy can not be called without OrderBy");
        }
        checkMissingArgument(keySelector, strKeySelector);
        var ks = checkIfFunction(keySelector, strKeySelector);

        //Set the comparer
        var comp = comparer || _defaultComparer;

        var result = _thenByRecursive(array, ks, comp, array.SortKeys, 0, asc);

        result.SortKeys = [];
        arrayPushAll(result.SortKeys, array.SortKeys);
        result.SortKeys.push({
            key: ks,
            dir: asc ? "asc" : "desc",
            comp: comp
        });
        return result;

    }

    function ThenBy(keySelector, comparer) {
        return _thenByCore(unwrap(this), keySelector, comparer, true);
    }

    function ThenByDescending(keySelector, comparer) {
        return _thenByCore(unwrap(this), keySelector, comparer, false);
    }

    function ToArray() {
        return mapWholeArray(unwrap(this));
    }

    //Missing overload ToDictionary(keySelector, comparer) 
    //  => Just pass a null for elementSelector
    function ToDictionary(keySelector, elementSelector, comparer) {
        checkMissingArgument(keySelector, strKeySelector);
        keySelector = checkIfFunction(keySelector, strKeySelector);
        elementSelector = ensureElementSelectorIsFunction(elementSelector);
        ensureEqualityComparerIsFunction(comparer);

        //Simulating a Dictionary with a Javascript object :-(
        var result = { Keys: [], Values: [], Count: 0 };

        //Set the elementSelector and the equalityComparer
        
        var elemSelect = elementSelector || function (item) { return item; };
        var equalComp = detectEqualityComparer(comparer);

        arrayForEach(unwrap(this), function (item) {
            var key = keySelector(item);
            var value = elemSelect(item);
            //Check if key already exists in the Dictionary
            arrayForEach(result.Keys, function (existingKey) {
                if (equalComp(key, existingKey)) {
                    _err("ArgumentException: An element with the same key already exists");
                }
            });
            //Add new Key / Value
            eval("result." + key + " = value");
            result.Keys.push(key);
            result.Values.push(value);
            result.Count = ++result.Count;
        });

        return result;
    }

    function ToLookup(keySelector, elementSelector, comparer) {
        return this.GroupBy(keySelector, elementSelector, null, comparer);
    }

    function ToObservableArray() {
        return wrap(this);
    };

    //#endregion

    //#region U

    function Union(second, comparer) {
        return wrap(this.Concat(second)).Distinct(comparer);
    }

    //#endregion

    //#region W

    var _WhereCore = function (original, predicate) {
        var i = -1;
        var result = arrayFilter(original, function (item) {
            i++;
            return predicate(item, i);
        });

        return result;
    }

    function Where(predicate) {
        checkMissingArgument(predicate, strPredicate);
        var p = ensurePredicateIsFunction(predicate);

        return _WhereCore(unwrap(this), p);
    }

    //#endregion

    //#region Z

    function Zip(second, resultSelector) {
        checkMissingArgument(second, strSecond);
        checkMissingArgument(resultSelector, strResultSelector);

        var secondArray = ensureSecondIsArray(second);
        resultSelector = ensureResultSelectorIsFunction(resultSelector);

        var original = unwrap(this);
        var max = original.length < secondArray.length ? original.length : secondArray.length;

        var result = [];
        for (var i = 0; i < max; i++) {
            result.push(resultSelector(original[i], secondArray[i]));
        }

        return result;
    }

    //#endregion


    //#region Private Array Helpers

    var arrayMap = function (array, mapper) {
        return array.map(mapper);
    };

    var arrayForEach = function (array, handler) {
        for (var i = 0, j = array.length; i < j; i++)
            handler(array[i]);
    };

    var arrayFilter = function (array, filter) {
        var result = [];
        for (var i = 0; i < array.length; i++) 
            if (filter(array[i])) 
                result.push(array[i]);
        return result;
    };

    var arrayFirst = function (array, filter) {
        for (var i = 0; i < array.length; i++) 
            if (filter(array[i]))
                return array[i];
        return null;
    };

    var arrayPushAll = function (array, valuesToPush) {
        for (var i = 0; i < valuesToPush.length; i++)
            array.push(valuesToPush[i]);
        return array;
    };

    var mapWholeArray = function (array) {
        return arrayMap(array, function (item) { return item; });
    }

    //#endregion

    //#region Private String Helpers

    var trim = function (source) {
        return source.trim ? source.trim() : source.replace(/^\s+|\s+$/g, '');
    }

    //var toCamelCase = function (source) {
    //	/// <param name="source" type="String"></param>
    //    return source.substr(0, 1) + source.substr(1);
    //}

    //#endregion

    //#region Knockout depending array methods

    var unwrap = function (possibleObservableArray) {
        return typeof ko != strUndefined ? ko.utils.unwrapObservable(possibleObservableArray) : possibleObservableArray;
    }

    var wrap = function (array) {
        return array.valueHasMutated ? array : (typeof ko != strUndefined ? ko.observableArray(array) : array);
    }

    //#endregion


    //#region Extend Javascript and Knockout with Linq Methods

    var methods = [Aggregate, All, Any, Average, Concat, Contains, Count, DefaultIfEmpty, Distinct, ElementAtOrDefault, ElementAt, Except, First, FirstOrDefault, GroupBy, GroupJoin, Intersect, Join, Last, LastOrDefault, LongCount, Max, Min, OfType, OrderBy, OrderByDescending, Reverse, Select, SelectMany, SequenceEqual, SingleOrDefault, Single, Skip, SkipWhile, Sum, Take, TakeWhile, ThenBy, ThenByDescending, ToArray, ToDictionary, ToLookup, Union, Where, Zip];

    arrayForEach(methods, function (func) {
        var funcName = func.toString().substring(func.toString().indexOf(" ") + 1, func.toString().indexOf("("));
        if (typeof ko != strUndefined)
            ko.observableArray.fn[funcName] = func;

        Array.prototype[funcName] = func;
    });

    //ko.observableArray.fn.Reverse = Reverse; //do not add reverse if camelCasing is enabled => Use standard Array method

    //Additional Properties
    if (typeof ko != strUndefined)
        Array.prototype.ToObservableArray = ToObservableArray; //Missing Tests for Array extension
    Array.prototype.Key = null;
    Array.prototype.SortKeys = null;

    //#endregion


    //#region Type Validation

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

    //#endregion

    return tinylinq;
})();