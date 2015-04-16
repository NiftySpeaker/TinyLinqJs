describe("tinylinq.knockout", function () {
    function ViewModel() {
        var self = this;

        self.people = ko.observableArray([]);

        self.people.push({ id: 1, firstName: 'Nifty', lastName: "Code", friends: [] });
        self.people.push({ id: 2, firstName: 'Scott', lastName: "Hanselman", friends: [] });
        self.people.push({ id: 3, firstName: 'Steven', lastName: "Sanderson", friends: [] });
        self.people.push({ id: 4, firstName: 'Ryan', lastName: "Niemeyer", friends: [] });
        self.people.push({ id: 5, firstName: 'Jon', lastName: "Skeet", friends: [] });

        self.people()[0].friends.push({ id: 6, firstName: 'Rob', lastName: "Connery", friends: [] });
        self.people()[0].friends.push({ id: 7, firstName: 'Scott', lastName: "Guthrie", friends: [] });
        self.people()[0].friends.push({ id: 8, firstName: 'Dave', lastName: "Ward", friends: [] });

        self.people()[1].friends.push({ id: 9, firstName: 'Justin', lastName: "Etheridge", friends: [] });
        self.people()[1].friends.push({ id: 10, firstName: 'Jon', lastName: "Galloway", friends: [] });

        return self;
    };
    var viewModel = new ViewModel(); //For intellisense support

    function JoinModel() {
        var self = this;

        self.friends = ko.observableArray(viewModel.people()[0].friends);
        ko.utils.arrayPushAll(self.friends(), viewModel.people()[1].friends);

        return self;
    }
    var joinModel = new JoinModel();

    var arraysAreDifferent = function (input, result) {
        /// <summary>
        /// Check, that the result array is not the same as the input array
        /// </summary>
        /// <param name="array1"></param>
        /// <param name="array2"></param>
        /// <returns type="Boolean"></returns>
        var a1 = ko.utils.unwrapObservable(input);
        var a2 = ko.utils.unwrapObservable(result);

        return !(a1 === a2);
    }

    beforeEach(function () {
        viewModel = new ViewModel();
    });


    describe("with delegate functions", function () {
        
        //#region A

        describe(".Aggregate", function () {

            it("no argument is passed, throws a ArgumentNullException", function () {
                //Act
                expect(function () {
                    var result = viewModel.people.Aggregate();
                }).toThrowError("ArgumentNullException: Missing seedOrFunc");
            });

            describe("overload 1: no seed, no resultSelector", function () {

                it("first (single) argument is not a function, throws a TypeLoadException", function () {
                    //Act
                    expect(function () {
                        var result = viewModel.people.Aggregate("no a function");
                    }).toThrowError("TypeLoadException: Argument seedOrFunc is not a function");

                });

                it("array has multiple strings => returns string concatination", function () {
                    //Arrange
                    var array = ko.observableArray(["Nifty", "Scott", "Ryan"]);
                    //Act
                    var result = array.Aggregate(function (accum, name) {
                        return accum + "," + name;
                    });
                    //Assert
                    expect(result).toBe("Nifty,Scott,Ryan");
                });

                it("array has multiple integers => returns sum of integers", function () {
                    //Arrange
                    var array = ko.observableArray([6, 11, 19]);
                    //Act
                    var result = array.Aggregate(function (accum, number) {
                        return accum + number;
                    });
                    //Assert
                    expect(result).toBe(36);
                });

                it("array has multiple objects => returns single object with same structure", function () {
                    //Act
                    var result = viewModel.people.Aggregate(function (accum, person) {
                        return {
                            firstName: accum.firstName + "," + person.firstName, //must be firstName -> Beware of type safety
                            id: accum.id + "," + person.id    //must be id -> Beware of type safety
                        };
                    });
                    //Assert
                    expect(result.firstName).toBe("Nifty,Scott,Steven,Ryan,Jon");
                    expect(result.id).toBe("1,2,3,4,5");
                });

                it("array has no elements => throws InvalidOperationException", function () {
                    var array = ko.observableArray();
                    expect(function () {
                        var result = array.Aggregate(function (a, p) {
                            return { id: a.id + p.id, firstName: a.firstName + p.firstName };
                        });
                    }).toThrowError("InvalidOperationException: The sequence contains no elements");
                });

                it("array has exact one element => returns the value of the first element", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    array.push({ id: 1, firstName: 'Nifty', lastName: "Code", friends: [] });
                    //Act
                    var result = array.Aggregate(function (accum, person) {
                        return {
                            firstName: accum.firstName + "," + person.firstName, //must be firstName -> Beware of type safety
                            id: accum.id + "," + person.id    //must be id -> Beware of type safety
                        };
                    });
                    //Assert
                    expect(result.firstName).toBe("Nifty");
                    expect(result.id).toBe(1);
                });

                it("array has exact one element and func returns fixed value => returns the value of the first element", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    array.push({ id: 1, firstName: 'Nifty', lastName: "Code", friends: [] });
                    //Act
                    var result = array.Aggregate(function (accum, person) {
                        return 20;
                    });
                    //Assert
                    expect(result.firstName).toBe("Nifty");
                    expect(result.id).toBe(1);
                });

            });

            describe("overload 2: with seed, no resultSelector", function () {

                it("first argument is a function, throws a TypeLoadException", function () {
                    //Act
                    expect(function () {
                        var result = viewModel.people.Aggregate(function () {
                            return "something";
                        },
                        function () {
                            return "other something";
                        });
                    }).toThrowError("TypeLoadException: Argument seedOrFunc can not be a function in this overload");

                });

                it("second argument is not a function, throws a TypeLoadException", function () {
                    //Act
                    expect(function () {
                        var result = viewModel.people.Aggregate("seed", "not a function");
                    }).toThrowError("TypeLoadException: Argument func is not a function");

                });

                it("array has multiple strings => returns string concatination", function () {
                    //Act
                    var result = viewModel.people.Aggregate("*", function (a, p) {
                        return a + "," + p.firstName;
                    });
                    //Assert
                    expect(result).toBe("*,Nifty,Scott,Steven,Ryan,Jon");
                });

                it("array has multiple strings => returns string concatination", function () {
                    //Arrange
                    var array = ko.observableArray(["Nifty", "Scott", "Ryan"]);
                    //Act
                    var result = array.Aggregate("", function (accum, name) {
                        return accum + "," + name;
                    });
                    //Assert
                    expect(result).toBe(",Nifty,Scott,Ryan");
                });

                it("array has multiple integers => returns sum of integers", function () {
                    //Arrange
                    var array = ko.observableArray([6, 11, 19]);
                    //Act
                    var result = array.Aggregate(0, function (accum, number) {
                        return accum + number;
                    });
                    //Assert
                    expect(result).toBe(36);
                });

                it("array has multiple objects => returns single object with same structure", function () {
                    //Act
                    var result = viewModel.people.Aggregate({id:0, firstName: ""}, function (accum, person) {
                        return {
                            firstName: accum.firstName + "," + person.firstName, //must be firstName -> Beware of type safety
                            id: accum.id + "," + person.id    //must be id -> Beware of type safety
                        };
                    });
                    //Assert
                    expect(result.firstName).toBe(",Nifty,Scott,Steven,Ryan,Jon");
                    expect(result.id).toBe("0,1,2,3,4,5");
                });

                it("array has no elements => returns seed", function () {
                    //Arrange
                    var array = ko.observableArray();
                    //Act
                    var result = array.Aggregate({ id: 0, firstName: "x", lastName: "y" }, function (a, p) {
                        return { id: a.id + p.id, firstName: a.firstName + p.firstName };
                    });
                    //Assert
                    expect(result.firstName).toBe("x");
                });

                it("array has exact one element => returns the value of the first element", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    array.push({ id: 1, firstName: 'Nifty', lastName: "Code", friends: [] });
                    //Act
                    var result = array.Aggregate({ id: 0, firstName: "x", lastName: "y" }, function (accum, person) {
                        return {
                            firstName: accum.firstName + "," + person.firstName, //must be firstName -> Beware of type safety
                            id: accum.id + person.id    //must be id -> Beware of type safety
                        };
                    });
                    //Assert
                    expect(result.firstName).toBe("x,Nifty");
                    expect(result.id).toBe(1);
                });

                it("array has exact one element and func returns fixed value => returns the fixed value", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    array.push({ id: 1, firstName: 'Nifty', lastName: "Code", friends: [] });
                    //Act
                    var result = array.Aggregate({ id: 42, firstName: 'a', lastName: "b", friends: [] }, function (accum, person) {
                        return { id: 0, firstName: 'x', lastName: "y", friends: [] };
                    });
                    //Assert
                    expect(result.firstName).toBe("x");
                    expect(result.id).toBe(0);
                });

                it("array has multiple elements and func returns fixed value => returns the fixed value", function () {
                    //Act
                    var result = viewModel.people.Aggregate({ id: 42, firstName: 'a', lastName: "b", friends: [] }, function (accum, person) {
                        return { id: 0, firstName: 'x', lastName: "y", friends: [] };
                    });
                    //Assert
                    expect(result.firstName).toBe("x");
                    expect(result.id).toBe(0);
                });

                it("array has multiple integers => returns average of integers", function () {
                    //Arrange
                    var array = ko.observableArray([6, 11, 19]);
                    //Act
                    var result = array.Aggregate(0,
                        function (accum, number) {
                            return accum + number;
                        },
                        function (a) {
                            return a / 3;
                        });
                    //Assert
                    expect(result).toBe(12);
                });

            });

            describe("overload 3: with seed and with resultSelector", function () {

                it("third argument is not a function, throws a TypeLoadException", function () {
                    //Act
                    expect(function () {
                        var result = viewModel.people.Aggregate("seed", function () {
                            return { id: 0, firstName: 'x', lastName: "y", friends: [] };
                        },
                        "not a function");
                    }).toThrowError("TypeLoadException: Argument resultSelector is not a function");
                });

                it("array has multiple strings => returns string concatination with pre and suffix", function () {
                    //Act
                    var result = viewModel.people.Aggregate("*",
                        function (a, p) {
                            return a + "," + p.firstName;
                        },
                        function (a) {
                            return "[" + a.substr(2) + "]";
                        });
                    //Assert
                    expect(result).toBe("[Nifty,Scott,Steven,Ryan,Jon]");
                });

                it("array has multiple objects => returns single object with same structure", function () {
                    //Act
                    var result = viewModel.people.Aggregate(
                        { sum: 0, count: 0 },
                        function (accum, person) {
                            return {
                                sum: accum.sum + person.id,
                                count: ++accum.count
                            };
                        },
                        function (accum) {
                            return accum.sum / accum.count;
                        });
                    //Assert
                    expect(result).toBe(3);
                });

            });

        });

        describe(".All", function () {

            it("array is empty, result should be true", function () {
                viewModel.people.removeAll();
                var bool = viewModel.people.All(function (p) {
                    return p.firstName.length > 4;
                });

                expect(bool).toBe(true);
            });

            it("array has wrong conditions, result should be false", function () {
                var bool = viewModel.people.All(function (p) {
                    return p.firstName.length > 4;
                });

                expect(bool).toBe(false);
            });

            it("has no predicate, should throw an ArgumentNullException", function () {
                expect(function () {
                    var bool = viewModel.people.All();
                }).toThrowError("ArgumentNullException: Missing predicate");
            });

            it("All has only correct conditions, should return true", function () {
                var bool = viewModel.people.All(function (p) {
                    return p.id < 10;
                });

                expect(bool).toBe(true);
            });

        })

        describe(".Any", function () {

            it("array is empty, result should be false", function () {
                viewModel.people.removeAll();
                var bool = viewModel.people.Any(function (p) {
                    return p.firstName.length > 4;
                });

                expect(bool).toBe(false);
            });

            it("array has only wrong conditions, result should be false", function () {
                var bool = viewModel.people.Any(function (p) {
                    return p.id > 10;
                });

                expect(bool).toBe(false);
            });

            it("has no predicate and array has elements, return true", function () {
                //Act
                var bool = viewModel.people.Any();
                //Assert
                expect(bool).toBe(true);
            });

            it("has no predicate and array has no elements, return false", function () {
                //Arrange
                var array = ko.observableArray([]);
                //Act
                var bool = array.Any();
                //Assert
                expect(bool).toBe(false);
            });

            it("has at lease one correct condition, should return true", function () {
                var bool = viewModel.people.Any(function (p) {
                    return p.id < 10;
                });

                expect(bool).toBe(true);
            });

        })

        describe(".Average", function () {

            it("with no selector and empty array, throws ArgumentNullException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.Average();
                }).toThrowError("ArgumentNullException: Missing selector");
            });

            it("with selector and empty array, throws InvalidOperationException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.Average(function (p) { return p.id > 2; });
                }).toThrowError("InvalidOperationException: The sequence contains no elements")
            });

            it("with no selector, throws an ArgumentNullException", function () {
                expect(function () {
                    var avg = viewModel.people.Average();
                }).toThrowError("ArgumentNullException: Missing selector");
            });

            it("returns integer", function () {
                var avg = viewModel.people.Average(function (p) {
                    return p.id;
                });
                expect(avg).toBe(3);
            });

            it("returns float", function () {
                viewModel.people.push({ id: 6, firstName: 'Rob', lastName: "Connery" });
                var avg = viewModel.people.Average(function (p) {
                    return p.id;
                });
                expect(avg).toBe(3.5);
            });

        });

        //#endregion

        //#region C

        describe(".Cast (WILL NOT BE IMPLEMENTED)", function () {

            it("check that it does not exist, throws an Error", function () {
                expect(function () {
                    var person = viewModel.people.Cast();
                }).toThrowError();
            });

        });

        describe(".Concat", function () {
            it("with no argument, throws an ArgumentNullException", function () {
                expect(function () {
                    var result = viewModel.people.Concat();
                }).toThrowError("ArgumentNullException: Missing second");
            });

            it("with observableArray argument, returns combined observableArray", function () {
                //Arrange
                var second = ko.observableArray([]);
                second.push({ id: 6, firstName: 'Rob', lastName: "Connery" });
                second.push({ id: 7, firstName: 'Scott', lastName: "Guthrie" });
                second.push({ id: 8, firstName: 'Dave', lastName: "Ward" });
                //Act
                var third = viewModel.people.Concat(second);
                //Assert
                expect(third.length).toBe(8);
                expect(third[5].firstName).toBe("Rob");
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(second().length).toBe(3);
                expect(arraysAreDifferent(viewModel.people, third)).toBe(true);
                expect(arraysAreDifferent(second, third)).toBe(true);
            });

            it("with Array argument, returns combined observableArray", function () {
                //Arrange
                var second = [];
                second.push({ id: 6, firstName: 'Rob', lastName: "Connery" });
                second.push({ id: 7, firstName: 'Scott', lastName: "Guthrie" });
                second.push({ id: 8, firstName: 'Dave', lastName: "Ward" });
                //Act
                var third = viewModel.people.Concat(second);
                //Assert
                expect(third.length).toBe(8);
                expect(third[5].firstName).toBe("Rob");
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(second.length).toBe(3);
                expect(arraysAreDifferent(viewModel.people, third)).toBe(true);
                expect(arraysAreDifferent(second, third)).toBe(true);
            });

            it("with empty observableArray argument, returns original observableArray", function () {
                //Arrange
                var second = ko.observableArray([]);
                //Act
                var third = viewModel.people.Concat(second);
                //Assert
                expect(third.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(second().length).toBe(0);
                expect(arraysAreDifferent(viewModel.people, third)).toBe(true);
                expect(arraysAreDifferent(second, third)).toBe(true);
            });

            it("with empty Array argument, returns original observableArray", function () {
                //Arrange
                var second = [];
                //Act
                var third = viewModel.people.Concat(second);
                //Assert
                expect(third.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(second.length).toBe(0);
                expect(arraysAreDifferent(viewModel.people, third)).toBe(true);
                expect(arraysAreDifferent(second, third)).toBe(true);
            });

            it("with observableArray argument and origial is empty, returns observableArray argument", function () {
                //Arrange
                var second = ko.observableArray([]);
                second.push({ id: 6, firstName: 'Rob', lastName: "Connery" });
                second.push({ id: 7, firstName: 'Scott', lastName: "Guthrie" });
                second.push({ id: 8, firstName: 'Dave', lastName: "Ward" });
                viewModel.people.removeAll();
                //Act
                var third = viewModel.people.Concat(second);
                //Assert
                expect(third.length).toBe(3);
                expect(third[2].firstName).toBe("Dave");
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(0);
                expect(second().length).toBe(3);
                expect(arraysAreDifferent(viewModel.people, third)).toBe(true);
                expect(arraysAreDifferent(second, third)).toBe(true);
            });

            it("with Array argument and origial is empty, returns Array argument as observableArray", function () {
                //Arrange
                var second = [];
                second.push({ id: 6, firstName: 'Rob', lastName: "Connery" });
                second.push({ id: 7, firstName: 'Scott', lastName: "Guthrie" });
                second.push({ id: 8, firstName: 'Dave', lastName: "Ward" });
                viewModel.people.removeAll();
                //Act
                var third = viewModel.people.Concat(second);
                //Assert
                expect(third.length).toBe(3);
                expect(third[2].firstName).toBe("Dave");
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(0);
                expect(second.length).toBe(3);
                expect(arraysAreDifferent(viewModel.people, third)).toBe(true);
                expect(arraysAreDifferent(second, third)).toBe(true);
            });

            it("with empty Array argument and origial is empty, returns empty observableArray", function () {
                //Arrange
                var second = [];
                viewModel.people.removeAll();
                //Act
                var third = viewModel.people.Concat(second);
                //Assert
                expect(third.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(0);
                expect(second.length).toBe(0);
                expect(arraysAreDifferent(viewModel.people, third)).toBe(true);
                expect(arraysAreDifferent(second, third)).toBe(true);
            });

            it("with empty observableArray argument and origial is empty, returns empty observableArray", function () {
                //Arrange
                var second = ko.observableArray([]);
                viewModel.people.removeAll();
                //Act
                var third = viewModel.people.Concat(second);
                //Assert
                expect(third.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(0);
                expect(second().length).toBe(0);
                expect(arraysAreDifferent(viewModel.people, third)).toBe(true);
                expect(arraysAreDifferent(second, third)).toBe(true);
            });

            it("with a non-Array argument, throws TypeLoadException", function () {
                //Arrange
                var second = { id: 17, name: "Hello" };
                //Act
                expect(function () {
                    var third = viewModel.people.Concat(second);
                }).toThrowError("TypeLoadException: Argument second is not an array"); //Assert

            });

            describe(".Average", function () {
                it("combined .Concat().Average() call", function () {
                    //Arrange
                    var second = ko.observableArray([]);
                    second.push({ id: 6, firstName: 'Rob', lastName: "Connery" });
                    second.push({ id: 7, firstName: 'Scott', lastName: "Guthrie" });
                    second.push({ id: 8, firstName: 'Dave', lastName: "Ward" });
                    //Act
                    var third = viewModel.people.Concat(second);
                    
                    var avg = third.Average(function (p) {
                        return p.id;
                    });
                    //Assert
                    expect(avg).toBe(4.5);
                    //Check that original Array(s) have not been mutated
                    expect(viewModel.people().length).toBe(5);
                    expect(second().length).toBe(3);
                    expect(arraysAreDifferent(viewModel.people, third)).toBe(true);
                    expect(arraysAreDifferent(second, third)).toBe(true);
                });
            })

        });

        describe(".Contains", function () {

            //item can be null, but in javascript null and undefined are equal (tested in iron browser)
            //it("with no argument, throws ArgumentNullException", function () {
            //    expect(function () {
            //        viewModel.people.Contains();
            //    }).toThrowError("ArgumentNullException: Missing item");
            //});

            describe("only with item argument", function () {

                it("with empty array, returns false", function () {
                    //Arrange
                    var array = ko.observableArray();
                    //Act
                    var bool = array.Contains("Anything");
                    //Assert
                    expect(bool).toBe(false);
                });

                it("with searched element which is not in the array, returns false", function () {
                    //Arrange
                    var person = viewModel.people()[0];
                    viewModel.people.remove(person);
                    //Act
                    var bool = viewModel.people.Contains(person);
                    //Assert
                    expect(bool).toBe(false);
                });

                it("with searched element which is in the array, returns true", function () {
                    //Arrange
                    var person = viewModel.people()[4];
                    //Act
                    var bool = viewModel.people.Contains(person);
                    //Assert
                    expect(bool).toBe(true);
                });

                it("with searched element is null and not in the array, returns false", function () {
                    //Act
                    var bool = viewModel.people.Contains(null);
                    //Assert
                    expect(bool).toBe(false);
                });

                it("with searched element is null and is in the array, returns true", function () {
                    //Arrange
                    viewModel.people.push(null);
                    //Act
                    var bool = viewModel.people.Contains(null);
                    //Assert
                    expect(bool).toBe(true);
                });

            });

            describe("with item and equalityComparer", function () {

                it("but equalityComparer is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.Contains(null, "Not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("with empty array, returns false", function () {
                    //Arrange
                    var array = ko.observableArray();
                    //Act
                    var bool = array.Contains("Anything", function (k1, k2) {
                        return k1 === k2;
                    });
                    //Assert
                    expect(bool).toBe(false);
                });

                it("with searched element which is not in the array, returns false", function () {
                    //Arrange
                    var person = viewModel.people()[0];
                    viewModel.people.remove(person);
                    //Act
                    var bool = viewModel.people.Contains(person, function (k1, k2) {
                        return k1.firstName === k2.firstName;
                    });
                    //Assert
                    expect(bool).toBe(false);
                });

                it("with searched element which is in the array, returns true", function () {
                    //Arrange
                    var person = viewModel.people()[4];
                    //Act
                    var bool = viewModel.people.Contains(person, function (k1, k2) {
                        return k1.firstName === k2.firstName;
                    });
                    //Assert
                    expect(bool).toBe(true);
                });

                it("with searched element which is in the array but the comparer says no, returns false", function () {
                    //Arrange
                    var person = viewModel.people()[0];
                    //Act
                    var bool = viewModel.people.Contains(person, function (k1, k2) {
                        return k1.lastName.substr(0, 1) === "X";
                    });
                    //Assert
                    expect(bool).toBe(false);
                });

                it("with searched element is null and not in the array, returns false", function () {
                    //Act
                    var bool = viewModel.people.Contains(null, function (k1, k2) {
                        return k1 === k2;
                    });
                    //Assert
                    expect(bool).toBe(false);
                });

                it("with searched element is null and is in the array, returns true", function () {
                    //Arrange
                    viewModel.people.push(null);
                    //Act
                    var bool = viewModel.people.Contains(null, function (k1, k2) {
                        return k1 === k2;
                    });
                    //Assert
                    expect(bool).toBe(true);
                });

            });

        });

        describe(".Count", function () {

            it("with no argument, returns number of list elements", function () {
                var i = viewModel.people.Count();
                expect(i).toBe(5);
            });

            it("with argument, returns number of matching elements", function () {
                var i = viewModel.people.Count(function (p) {
                    return p.id > 3;
                });
                expect(i).toBe(2);
            });

            it("with no matching predicate, returns zero", function () {
                var i = viewModel.people.Count(function (p) {
                    return p.id < 0;
                });
                expect(i).toBe(0);
            });

        });

        //#endregion

        //#region D

        describe(".DefaultIfEmpty", function () {

            it("observableArray without underlying with no argument, returns observableArray with one row = null", function () {
                var newArray = ko.observableArray();
                var result = newArray.DefaultIfEmpty();
                expect(result.length).toBe(1);
                expect(result[0]).toBe(null);
                //Check that original Array(s) have not been mutated
                expect(newArray().length).toBe(0);
                expect(arraysAreDifferent(newArray, result)).toBe(true);
            });

            it("empty observableArray with no argument, returns observableArray with one row = null", function () {
                var newArray = ko.observableArray([]);
                var result = newArray.DefaultIfEmpty();
                expect(result.length).toBe(1);
                expect(result[0]).toBe(null);
                //Check that original Array(s) have not been mutated
                expect(newArray().length).toBe(0);
                expect(arraysAreDifferent(newArray, result)).toBe(true);
            });

            it("empty observableArray with defaultValue, returns observableArray with one row = defaultValue", function () {
                var newArray = ko.observableArray([]);
                var result = newArray.DefaultIfEmpty("Nothing");
                expect(result.length).toBe(1);
                expect(result[0]).toBe("Nothing");
                //Check that original Array(s) have not been mutated
                expect(newArray().length).toBe(0);
                expect(arraysAreDifferent(newArray, result)).toBe(true);
            });

            it("filled observableArray with no argument, returns observableArray", function () {
                var result = viewModel.people.DefaultIfEmpty();
                expect(result.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("filled observableArray with argument, returns observableArray", function () {
                var result = viewModel.people.DefaultIfEmpty("Nothing");
                expect(result.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

        });

        describe(".Distinct", function () {

            describe("without equalityComparer", function () {

                it("empty array, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray();
                    //Act
                    var result = array.Distinct();
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("array has one element, returns array with one element", function () {
                    //Arrange
                    var array = ko.observableArray();
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = array.Distinct();
                    //Assert
                    expect(result.length).toBe(1);
                });

                it("all elements in the array are unique, returns all elements", function () {
                    //Act
                    var result = viewModel.people.Distinct();
                    //Assert
                    expect(result.length).toBe(5);
                });

                it("some elements in the array are duplicates, returns unique elements", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[1]);
                    viewModel.people.push(viewModel.people()[4]);
                    viewModel.people.push(viewModel.people()[1]);
                    //Act
                    var result = viewModel.people.Distinct();
                    //Assert
                    expect(result.length).toBe(5);
                });

            });

            describe("with equalityComparer", function () {

                it("but equalityComparer is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.Distinct("Not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("empty array, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray();
                    //Act
                    var result = array.Distinct(function (p1, p2) {
                        return p1.substr(0, 1) === p2.substr(0, 1);
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("array has one element, returns array with one element", function () {
                    //Arrange
                    var array = ko.observableArray();
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = array.Distinct(function (p1, p2) {
                        return p1.firstName.substr(0, 1) === p2.firstName.substr(0, 1);
                    });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].firstName).toBe('Nifty');
                });

                it("all elements in the array are unique, returns all elements", function () {
                    //Act
                    var result = viewModel.people.Distinct(function (p1, p2) {
                        return p1.firstName.substr(0, 2) === p2.firstName.substr(0, 2);
                    });
                    //Assert
                    expect(result.length).toBe(5);
                });

                it("some elements in the array are duplicates, returns unique elements", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[1]);
                    viewModel.people.push(viewModel.people()[4]);
                    viewModel.people.push(viewModel.people()[1]);
                    //Act
                    var result = viewModel.people.Distinct(function (p1, p2) {
                        return p1.firstName.substr(0, 1) === p2.firstName.substr(0, 1);
                    });
                    //Assert
                    expect(result.length).toBe(4);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Ryan');
                    expect(result[3].firstName).toBe('Jon');
                });

            });

        });

        //#endregion    

        //#region E

        describe(".ElementAt", function () {
            it("with no argument, throws an ArgumentNullException", function () {
                expect(function () {
                    var result = viewModel.people.ElementAt();
                }).toThrowError("ArgumentNullException: Missing index");
            });

            it("with proper index, returns object", function () {
                var person = viewModel.people.ElementAt(2);
                expect(person.firstName).toBe("Steven");
            });

            it("with wrong index, throws ArgumentOutOfRangeException", function () {
                expect(function () {
                    var person = viewModel.people.ElementAt(42);
                }).toThrowError("ArgumentOutOfRangeException: The index was out of range.")
            });

            it("with non numeric index, throws TypeLoadException", function () {
                expect(function () {
                    var person = viewModel.people.ElementAt("hello");
                }).toThrowError("TypeLoadException: Argument index is not an int");
            });

            it("with numeric but non integer index, throws TypeLoadException", function () {
                expect(function () {
                    var person = viewModel.people.ElementAt(7.5);
                }).toThrowError("TypeLoadException: Argument index is not an int");
            });

        });

        describe(".ElementAtOrDefault", function () {
            it("with no argument, throws an ArgumentNullException", function () {
                expect(function () {
                    var result = viewModel.people.ElementAtOrDefault();
                }).toThrowError("ArgumentNullException: Missing index");
            });

            it("with proper index, returns object", function () {
                var person = viewModel.people.ElementAtOrDefault(2);
                expect(person.firstName).toBe("Steven");
            });

            it("with wrong index, returns null", function () {
                var person = viewModel.people.ElementAtOrDefault(2);
                expect(person.firstName).toBe("Steven");
            });

            it("with non numeric index, throws TypeLoadException", function () {
                expect(function () {
                    var person = viewModel.people.ElementAtOrDefault("hello");
                }).toThrowError("TypeLoadException: Argument index is not an int");
            });

            it("with numeric but non integer index, throws TypeLoadException", function () {
                expect(function () {
                    var person = viewModel.people.ElementAtOrDefault(7.5);
                }).toThrowError("TypeLoadException: Argument index is not an int");
            });

        });

        describe(".Empty (WILL NOT BE IMPLEMENTED)", function () {

            it("check that it does not exist, throws an Error", function () {
                expect(function () {
                    var person = viewModel.people.Empty();
                }).toThrowError();
            });
        });

        describe(".Except", function () {

            it("without second argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Except();
                }).toThrowError("ArgumentNullException: Missing second");
            });

            describe("without equalityComparer", function () {

                it("second argument is not an array, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.Except({ any: 'something' });
                    }).toThrowError("TypeLoadException: Argument second is not an array");
                });

                it("input sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.Except(viewModel.people);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument is an empty array, returns input secuence", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.Except(array);
                    //Assert
                    expect(result.length).toBe(5);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument is identical to input sequence, return empty array", function () {
                    //Act
                    var result = viewModel.people.Except(viewModel.people);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });

                it("second argument has same elements as input sequence, return empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    for (var i = 0; i < viewModel.people().length; i++) {
                        array.push(viewModel.people()[i]);
                    }
                    //Act
                    var result = viewModel.people.Except(array);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument has different elements as input sequence, returns input sequence", function () {
                    //Arrange
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    //Act
                    var result = viewModel.people.Except(array);
                    //Assert
                    expect(result.length).toBe(5);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("second argument has one same element as input sequence, returns input sequence without this element", function () {
                    //Arrange
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = viewModel.people.Except(array);
                    //Assert
                    expect(result.length).toBe(4);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("input sequence has duplicate value but second sequence has not the value, returns the value once", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[0]); //Duplicate value
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    //Act
                    var result = viewModel.people.Except(array);
                    //Assert
                    expect(result.length).toBe(5);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("input sequence has duplicate value and second sequence has also the value, does not return this element", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[0]); //Duplicate value
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = viewModel.people.Except(array);
                    //Assert
                    expect(result.length).toBe(4);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

            });

            describe("with equalityComparer", function () {

                it("second argument is not an array, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.Except({ any: 'something' }, function (p1, p2) { return p1.lastName === p2.lastName; });
                    }).toThrowError("TypeLoadException: Argument second is not an array");
                });

                it("input sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.Except(viewModel.people, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument is an empty array, returns input secuence", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.Except(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument is identical to input sequence, return empty array", function () {
                    //Act
                    var result = viewModel.people.Except(viewModel.people, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });

                it("second argument has same elements as input sequence, return empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    for (var i = 0; i < viewModel.people().length; i++) {
                        array.push(viewModel.people()[i]);
                    }
                    //Act
                    var result = viewModel.people.Except(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument has different elements as input sequence, returns input sequence", function () {
                    //Arrange
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    //Act
                    var result = viewModel.people.Except(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("second argument has one same element as input sequence, returns input sequence without this element", function () {
                    //Arrange
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = viewModel.people.Except(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(4);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("input sequence has duplicate value but second sequence has not the value, returns the value once", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[0]); //Duplicate value
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    //Act
                    var result = viewModel.people.Except(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("input sequence has duplicate value and second sequence has also the value, does not return this element", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[0]); //Duplicate value
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = viewModel.people.Except(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(4);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

            });

        });

        //#endregion

        //#region F

        describe(".First", function () {

            it("with no argument and empty array, throws InvalidOperationException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.First();
                }).toThrowError("InvalidOperationException: The sequence contains no elements")
            });

            it("with argument and empty array, throws InvalidOperationException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.First(function (p) { return p.id > 2; });
                }).toThrowError("InvalidOperationException: The sequence contains no elements")
            });

            it("with no argument, returns first element", function () {
                var person = viewModel.people.First();
                expect(person.firstName).toBe("Nifty");
            });

            it("with predicate, returns first matching element", function () {
                var person = viewModel.people.First(function (p) {
                    return p.id > 2;
                });
                expect(person.firstName).toBe("Steven");
            });

            it("with wrong predicate, throws InvalidOperationException", function () {
                expect(function () {
                    var person = viewModel.people.First(function (p) {
                        return p.id > 200;
                    });
                }).toThrowError("InvalidOperationException: The sequence contains no matching element")
            });

        });

        describe(".FirstOrDefault", function () {

            it("with no argument and empty array, returns null", function () {
                var array = ko.observableArray();
                var person = array.FirstOrDefault();
                expect(person).toBe(null);
            });

            it("with argument and empty array, returns null", function () {
                var array = ko.observableArray();
                var person = array.FirstOrDefault(function (p) { return p.id > 2; });
                expect(person).toBe(null);
            });

            it("with no argument, returns first element", function () {
                var person = viewModel.people.FirstOrDefault();
                expect(person.firstName).toBe("Nifty");
            });

            it("with predicate, returns first matching element", function () {
                var person = viewModel.people.FirstOrDefault(function (p) {
                    return p.id > 2;
                });
                expect(person.firstName).toBe("Steven");
            });

            it("with wrong predicate, returns null", function () {
                var person = viewModel.people.FirstOrDefault(function (p) {
                    return p.id > 200;
                });
                expect(person).toBe(null);
            });

        });

        //#endregion

        //#region G

        describe(".GroupBy", function () {

            //Ausgabe der Groups in die Console
            //ko.utils.arrayForEach(result, function (group) {
            //    console.log(group.Key);
            //    ko.utils.arrayForEach(group, function (item) {
            //        console.log("    " + item.firstName);
            //    });
            //});

            it("without argument, throws ArgumentNullException", function () {
                expect(function () {
                    var result = viewModel.people.GroupBy();
                }).toThrowError("ArgumentNullException: Missing keySelector");

            });

            describe("with keySelector", function () {

                it("but keySelector is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.GroupBy("Not a function");
                    }).toThrowError("TypeLoadException: Argument keySelector is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a group for each element", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0][0].firstName).toBe(viewModel.people()[0].firstName);
                });

                it("all elements in the array have the same key, returns a single group for all elements", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].length).toBe(5);
                    expect(result[0][0].firstName).toBe("Nifty");


                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        if (i < 2) {
                            viewModel.people()[i].myKey = "Stan";
                        }
                        else {
                            viewModel.people()[i].myKey = "Oli";
                        }
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; });
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[1].Key).toBe("Oli");
                    expect(result[0].length).toBe(2);
                    expect(result[1].length).toBe(3);
                    expect(result[0][0].firstName).toBe("Nifty");
                    expect(result[0][1].firstName).toBe("Scott");
                    expect(result[1][2].firstName).toBe("Jon");

                    //ko.utils.arrayForEach(result, function (group) {
                    //    console.log(group.Key);
                    //    ko.utils.arrayForEach(group(), function (item) {
                    //        console.log("    " + item.firstName);
                    //    });
                    //});

                });
            });

            describe("with keySelector and elementSelector", function () {

                it("but elementSelector is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument elementSelector is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a group for each element", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0][0]).toBe(viewModel.people()[0].lastName);
                });

                it("all elements in the array have the same key, returns a single group for all elements", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          function (p) { return p.lastName; });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].length).toBe(5);
                    expect(result[0][0]).toBe("Code");
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        if (i < 2) {
                            viewModel.people()[i].myKey = "Stan";
                        }
                        else {
                            viewModel.people()[i].myKey = "Oli";
                        }
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          function (p) { return p.lastName; });
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[1].Key).toBe("Oli");
                    expect(result[0].length).toBe(2);
                    expect(result[1].length).toBe(3);
                    expect(result[0][0]).toBe("Code");
                    expect(result[0][1]).toBe("Hanselman");
                    expect(result[1][2]).toBe("Skeet");
                });

            });

            describe("with keySelector, elementSelector and resultSelector", function () {

                it("but resultSelector is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                              function (p) { return p.lastName; },
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument resultSelector is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; },
                                                          function (key, values) {
                                                              return { Key: key, Count: values().Count() }
                                                          });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a row for each element", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; },
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0].Count).toBe(1);
                });

                it("all elements in the array have the same key, returns a single row", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          function (p) { return p.lastName; },
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].Count).toBe(5);
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        if (i < 2) {
                            viewModel.people()[i].myKey = "Stan";
                        }
                        else {
                            viewModel.people()[i].myKey = "Oli";
                        }
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          function (p) { return p.lastName; },
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          });
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[1].Key).toBe("Oli");
                    expect(result[0].Count).toBe(2);
                    expect(result[1].Count).toBe(3);
                });

            });

            describe("with keySelector, elementSelector, resultSelector and equalityComparer", function () {

                it("but equalityComparer is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                              function (p) { return p.lastName; },
                                                              function (key, values) {
                                                                  return { Key: key, Count: values().Count() }
                                                              },
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; },
                                                          function (key, values) {
                                                              return { Key: key, Count: values().Count() }
                                                          },
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a row for each element", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; },
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          },
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0].Count).toBe(1);
                });

                it("all elements in the array have the same key, returns a single row", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          function (p) { return p.lastName; },
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          },
                                                          function (p1, p2) {
                                                              return p1.length < 7 && p2.length < 7;
                                                          });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].Count).toBe(5);
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p; },
                                                          function (p) { return p.lastName; },
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          },
                                                          function (p1, p2) {
                                                              return p1.firstName.substr(0, 1) == p2.firstName.substr(0, 1);
                                                          });
                    //Assert
                    expect(result.length).toBe(4);
                    expect(result[0].Key.firstName).toBe("Nifty");
                    expect(result[1].Key.firstName).toBe("Scott");
                    expect(result[2].Key.firstName).toBe("Ryan");
                    expect(result[3].Key.firstName).toBe("Jon");
                    expect(result[0].Count).toBe(1);
                    expect(result[1].Count).toBe(2);
                    expect(result[2].Count).toBe(1);
                    expect(result[3].Count).toBe(1);
                });
            });

            describe("with keySelector and equalityComparer", function () {

                it("but equalityComparer is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                              null,
                                                              null,
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          null,
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a row for each element", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          null,
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0].length).toBe(1);
                });

                it("all elements in the array have the same key, returns a single row", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          null,
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.length < 7 && p2.length < 7;
                                                          });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].length).toBe(5);
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p; },
                                                          null,
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.firstName.substr(0, 1) == p2.firstName.substr(0, 1);
                                                          });
                    //Assert
                    expect(result.length).toBe(4);
                    expect(result[0].Key.firstName).toBe("Nifty");
                    expect(result[1].Key.firstName).toBe("Scott");
                    expect(result[2].Key.firstName).toBe("Ryan");
                    expect(result[3].Key.firstName).toBe("Jon");
                    expect(result[0].length).toBe(1);
                    expect(result[1].length).toBe(2);
                    expect(result[2].length).toBe(1);
                    expect(result[3].length).toBe(1);
                });

            });

            describe("with keySelector and resultSelector", function () {

                it("but resultSelector is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                              null,
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument resultSelector is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          null,
                                                          function (key, values) {
                                                              return { Key: key, Count: values().Count() }
                                                          });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a row for each element", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          null,
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0].Count).toBe(1);
                });

                it("all elements in the array have the same key, returns a single row", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          null,
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].Count).toBe(5);
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        if (i < 2) {
                            viewModel.people()[i].myKey = "Stan";
                        }
                        else {
                            viewModel.people()[i].myKey = "Oli";
                        }
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          null,
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          });
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[1].Key).toBe("Oli");
                    expect(result[0].Count).toBe(2);
                    expect(result[1].Count).toBe(3);
                });

            });

            describe("with keySelector, elementSelector and equalityComparer", function () {

                it("but equalityComparer is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                              function (p) { return p.lastName; },
                                                              null,
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; },
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a row for each element", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; },
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0][0]).toBe('Code');
                });

                it("all elements in the array have the same key, returns a single row", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          function (p) { return p.lastName; },
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.length < 7 && p2.length < 7;
                                                          });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].length).toBe(5);
                    expect(result[0][0]).toBe('Code');
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p; },
                                                          function (p) { return p.lastName; },
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.firstName.substr(0, 1) == p2.firstName.substr(0, 1);
                                                          });
                    //Assert
                    expect(result.length).toBe(4);
                    expect(result[0].Key.firstName).toBe("Nifty");
                    expect(result[1].Key.firstName).toBe("Scott");
                    expect(result[2].Key.firstName).toBe("Ryan");
                    expect(result[3].Key.firstName).toBe("Jon");
                    expect(result[0].length).toBe(1);
                    expect(result[1].length).toBe(2);
                    expect(result[2].length).toBe(1);
                    expect(result[3].length).toBe(1);
                    expect(result[1][0]).toBe('Hanselman');
                    expect(result[1][1]).toBe('Sanderson');
                });

            });

            describe("with keySelector, resultSelector and equalityComparer", function () {

                it("but equalityComparer is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                              null,
                                                              function (key, values) {
                                                                  return { Key: key, Count: values().Count() }
                                                              },
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          null,
                                                          function (key, values) {
                                                              return { Key: key, Count: values().Count() }
                                                          },
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a row for each element", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.firstName; },
                                                          null,
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          },
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0].Count).toBe(1);
                });

                it("all elements in the array have the same key, returns a single row", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p.myKey; },
                                                          null,
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          },
                                                          function (p1, p2) {
                                                              return p1.length < 7 && p2.length < 7;
                                                          });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].Count).toBe(5);
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Act
                    var result = viewModel.people.GroupBy(function (p) { return p; },
                                                          null,
                                                          function (key, values) {
                                                              return { Key: key, Count: values.Count() }
                                                          },
                                                          function (p1, p2) {
                                                              return p1.firstName.substr(0, 1) == p2.firstName.substr(0, 1);
                                                          });
                    //Assert
                    expect(result.length).toBe(4);
                    expect(result[0].Key.firstName).toBe("Nifty");
                    expect(result[1].Key.firstName).toBe("Scott");
                    expect(result[2].Key.firstName).toBe("Ryan");
                    expect(result[3].Key.firstName).toBe("Jon");
                    expect(result[0].Count).toBe(1);
                    expect(result[1].Count).toBe(2);
                    expect(result[2].Count).toBe(1);
                    expect(result[3].Count).toBe(1);
                });

            });

        });

        describe(".GroupJoin", function () {

            it("without inner sequence argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.GroupJoin();
                }).toThrowError("ArgumentNullException: Missing inner");
            });

            it("without outerKeySelector argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.GroupJoin(joinModel);
                }).toThrowError("ArgumentNullException: Missing outerKeySelector");
            });

            it("without innerKeySelector argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.GroupJoin(joinModel, function (p) {
                        return p.firstName;
                    });
                }).toThrowError("ArgumentNullException: Missing innerKeySelector");
            });

            it("without resultSelector argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.GroupJoin(joinModel, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    });
                }).toThrowError("ArgumentNullException: Missing resultSelector");
            });

            it("with inner sequence argument is not an array, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.GroupJoin({ someProperty: "not an array" }, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    },
                    function (p, f) {
                        return { person: p, friend: f };
                    });
                }).toThrowError("TypeLoadException: Argument inner is not an array");
            });

            it("with outerKeySelector argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.GroupJoin(joinModel.friends, "not a function", function (f) {
                        return f.firstName;
                    },
                    function (p, f) {
                        return { person: p, friend: f };
                    });
                }).toThrowError("TypeLoadException: Argument outerKeySelector is not a function");
            });

            it("with innerKeySelector argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.GroupJoin(joinModel.friends, function (p) {
                        return p.firstName;
                    }, "not a function",
                    function (p, f) {
                        return { person: p, friend: f };
                    });
                }).toThrowError("TypeLoadException: Argument innerKeySelector is not a function");
            });

            it("with resultSelector argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.GroupJoin(joinModel.friends, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, "not a function");
                }).toThrowError("TypeLoadException: Argument resultSelector is not a function");
            });

            describe("with single key selectors and without equalityComparer", function () {

                it("outer sequence is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupJoin(joinModel.friends, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friends: f };
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("inner sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.GroupJoin(array, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friends: f };
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("without matching elements, returns empty array", function () {
                    //Act
                    var result = viewModel.people.GroupJoin(joinModel.friends,
                        function (p) { return p.lastName; },
                        function (f) { return f.lastName; },
                        function (p, f) { return { person: p, friends: f }; }
                    );
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("with matching elements, returns matched elements", function () {
                    //Act
                    var result = viewModel.people.GroupJoin(joinModel.friends,
                        function (p) { return p.firstName; },
                        function (f) { return f.firstName; },
                        function (p, f) { return { person: p, friends: f }; }
                    );
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].person.lastName).toBe("Hanselman");
                    expect(result[0].friends.length).toBe(1);
                    expect(result[0].friends[0].lastName).toBe("Guthrie");
                });
            });

            describe("with single key selectors and with equalityComparer", function () {

                it("equalityComparer argument is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.GroupJoin(joinModel.friends, function (p) {
                            return p.firstName;
                        }, function (f) {
                            return f.firstName;
                        }, function (p, f) {
                            return { person: p, friends: f };
                        }, "not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("outer sequence is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.Join(joinModel.friends, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friends: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });
                
                it("inner sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.GroupJoin(array, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friends: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });
                
                it("without matching elements, returns empty array", function () {
                    //Act
                    var result = viewModel.people.GroupJoin(joinModel.friends,
                        function (p) { return p.lastName; },
                        function (f) { return f.lastName; },
                        function (p, f) { return { person: p, friends: f }; },
                        function (k1, k2) {
                            return k1.length === 1;
                        });

                    //Assert
                    expect(result.length).toBe(0);
                });

                it("with matching elements, returns matched elements", function () {
                    //Act
                    var result = viewModel.people.GroupJoin(joinModel.friends, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friends: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[4].person.lastName).toBe('Skeet');
                    expect(result[4].friends[0].lastName).toBe('Connery');
                    expect(result[4].friends[1].lastName).toBe('Galloway');
                });

            });

            describe("with multi key selectors and without equalityComparer", function () {

                it("outer sequence is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupJoin(joinModel.friends, function (p) {
                        return { fn: p.firstName, ln: p.lastName };
                    }, function (f) {
                        return { fn: f.firstName, ln: f.lastName };
                    }, function (p, f) {
                        return { person: p, friends: f };
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });
                
                it("inner sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.GroupJoin(array, function (p) {
                        return { fn: p.firstName, ln: p.lastName };
                    }, function (f) {
                        return { fn: f.firstName, ln: f.lastName };
                    }, function (p, f) {
                        return { person: p, friends: f };
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });
                
                it("without matching elements, returns empty array", function () {
                    //Act
                    var result = viewModel.people.GroupJoin(joinModel.friends,
                        function (p) { return { fn: p.firstName, ln: p.lastName }; },
                        function (f) { return { fn: f.firstName, ln: f.lastName }; },
                        function (p, f) { return { person: p, friends: f }; }
                    );
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("with matching elements, returns matched elements", function () {
                    //Arrange
                    var array = [];
                    array.push(viewModel.people()[0]);
                    array.push(viewModel.people()[3]);
                    //Act
                    var result = viewModel.people.GroupJoin(array,
                        function (p) { return { fn: p.firstName, ln: p.lastName }; },
                        function (f) { return { fn: f.firstName, ln: f.lastName }; },
                        function (p, f) { return { person: p, friends: f }; }
                    );
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].person.firstName).toBe("Nifty");
                    expect(result[0].friends[0].firstName).toBe("Nifty");
                    expect(result[1].person.firstName).toBe("Ryan");
                    expect(result[1].friends[0].firstName).toBe("Ryan");
                });
            });

            describe("with multi key selectors and with equalityComparer", function () {

                it("outer sequence is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.GroupJoin(joinModel.friends, function (p) {
                        return { fn: p.firstName, ln: p.lastName };
                    }, function (f) {
                        return { fn: f.firstName, ln: f.lastName };
                    }, function (p, f) {
                        return { person: p, friends: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("inner sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.GroupJoin(array, function (p) {
                        return { fn: p.firstName, ln: p.lastName };
                    }, function (f) {
                        return { fn: f.firstName, ln: f.lastName };
                    }, function (p, f) {
                        return { person: p, friends: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("without matching elements, returns empty array", function () {
                    //Act
                    var result = viewModel.people.GroupJoin(joinModel.friends,
                        function (p) { return { fn: p.firstName, ln: p.lastName }; },
                        function (f) { return { fn: f.firstName, ln: f.lastName }; },
                        function (p, f) { return { person: p, friends: f }; },
                        function (k1, k2) { return k1.fn === k2.fn && k1.ln === k2.ln; }
                    );
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("with matching elements, returns matched elements", function () {
                    //Arrange
                    var array = [];
                    array.push(viewModel.people()[0]);
                    array.push(viewModel.people()[3]);
                    //Act
                    var result = viewModel.people.GroupJoin(array,
                        function (p) { return { fn: p.firstName, ln: p.lastName }; },
                        function (f) { return { fn: f.firstName, ln: f.lastName }; },
                        function (p, f) { return { person: p, friends: f }; },
                        function (k1, k2) { return k1.fn === k2.fn && k1.ln === k2.ln; }
                    );
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].person.firstName).toBe("Nifty");
                    expect(result[0].friends[0].firstName).toBe("Nifty");
                    expect(result[1].person.firstName).toBe("Ryan");
                    expect(result[1].friends[0].firstName).toBe("Ryan");
                });
            });

        });

        //#endregion

        //#region I

        describe(".Intersect", function () {

            it("without second argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Intersect();
                }).toThrowError("ArgumentNullException: Missing second");
            });

            describe("without equalityComparer", function () {

                it("second argument is not an array, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.Intersect({ any: 'something' });
                    }).toThrowError("TypeLoadException: Argument second is not an array");
                });

                it("input sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.Intersect(viewModel.people);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument is an empty array, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.Intersect(array);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument is identical to input sequence, return input sequence unique", function () {
                    //Act
                    var result = viewModel.people.Intersect(viewModel.people);
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });

                it("second argument has same elements as input sequence, return input sequence unique", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    for (var i = 0; i < viewModel.people().length; i++) {
                        array.push(viewModel.people()[i]);
                    }
                    //Act
                    var result = viewModel.people.Intersect(array);
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument has different elements as input sequence, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    //Act
                    var result = viewModel.people.Intersect(array);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("second argument has one same element as input sequence, returns array with one element", function () {
                    //Arrange
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = viewModel.people.Intersect(array);
                    //Assert
                    expect(result.length).toBe(1);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("input sequence has duplicate value but second sequence has not the value, does not return the value", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[0]); //Duplicate value
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    //Act
                    var result = viewModel.people.Intersect(array);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("input sequence has duplicate value and second sequence has also the value, returns the value once", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[0]); //Duplicate value
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = viewModel.people.Intersect(array);
                    //Assert
                    expect(result.length).toBe(1);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

            });

            describe("with equalityComparer", function () {

                it("second argument is not an array, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.Intersect({ any: 'something' }, function (p1, p2) { return p1.lastName === p2.lastName; });
                    }).toThrowError("TypeLoadException: Argument second is not an array");
                });

                it("input sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.Intersect(viewModel.people, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument is an empty array, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.Intersect(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument is identical to input sequence, return input sequence unique", function () {
                    //Act
                    var result = viewModel.people.Intersect(viewModel.people, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });

                it("second argument has same elements as input sequence, return input sequence unique", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    for (var i = 0; i < viewModel.people().length; i++) {
                        array.push(viewModel.people()[i]);
                    }
                    //Act
                    var result = viewModel.people.Intersect(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                });

                it("second argument has different elements as input sequence, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    //Act
                    var result = viewModel.people.Intersect(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("second argument has one same element as input sequence, returns array with one element", function () {
                    //Arrange
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = viewModel.people.Intersect(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("input sequence has duplicate value but second sequence has not the value, does not return the value", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[0]); //Duplicate value
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    //Act
                    var result = viewModel.people.Intersect(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

                it("input sequence has duplicate value and second sequence has also the value, returns the value once", function () {
                    //Arrange
                    viewModel.people.push(viewModel.people()[0]); //Duplicate value
                    var array = ko.observableArray(viewModel.people()[0].friends);
                    array.push(viewModel.people()[0]);
                    //Act
                    var result = viewModel.people.Intersect(array, function (p1, p2) { return p1.lastName === p2.lastName; });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                    expect(arraysAreDifferent(array, result)).toBe(true);
                    expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
                });

            });

        });

        //#endregion

        //#region J

        describe(".Join", function () {

            it("without inner sequence argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Join();
                }).toThrowError("ArgumentNullException: Missing inner");
            });

            it("without outerKeySelector argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Join(joinModel);
                }).toThrowError("ArgumentNullException: Missing outerKeySelector");
            });

            it("without innerKeySelector argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Join(joinModel, function (p) {
                        return p.firstName;
                    });
                }).toThrowError("ArgumentNullException: Missing innerKeySelector");
            });

            it("without resultSelector argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Join(joinModel, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    });
                }).toThrowError("ArgumentNullException: Missing resultSelector");
            });

            it("with inner sequence argument is not an array, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.Join({ someProperty: "not an array" }, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    },
                    function (p, f) {
                        return { person: p, friend: f };
                    });
                }).toThrowError("TypeLoadException: Argument inner is not an array");
            });

            it("with outerKeySelector argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.Join(joinModel.friends, "not a function", function (f) {
                        return f.firstName;
                    },
                    function (p, f) {
                        return { person: p, friend: f };
                    });
                }).toThrowError("TypeLoadException: Argument outerKeySelector is not a function");
            });

            it("with innerKeySelector argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.Join(joinModel.friends, function (p) {
                        return p.firstName;
                    }, "not a function",
                    function (p, f) {
                        return { person: p, friend: f };
                    });
                }).toThrowError("TypeLoadException: Argument innerKeySelector is not a function");
            });

            it("with resultSelector argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.Join(joinModel.friends, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, "not a function");
                }).toThrowError("TypeLoadException: Argument resultSelector is not a function");
            });

            describe("with single key selectors and without equalityComparer", function () {

                it("outer sequence is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.Join(joinModel.friends, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friend: f };
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("inner sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.Join(array, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friend: f };
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("without matching elements, returns empty array", function () {
                    //Act
                    var result = viewModel.people.Join(joinModel.friends,
                        function (p) { return p.lastName; },
                        function (f) { return f.lastName; },
                        function (p, f) { return { person: p, friend: f }; }
                    );
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("with matching elements, returns matched elements", function () {
                    //Act
                    var result = viewModel.people.Join(joinModel.friends,
                        function (p) { return p.firstName; },
                        function (f) { return f.firstName; },
                        function (p, f) { return { person: p, friend: f }; }
                    );
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].person.lastName).toBe("Hanselman");
                    expect(result[0].friend.lastName).toBe("Guthrie");
                });
            });

            describe("with single key selectors and with equalityComparer", function () {

                it("equalityComparer argument is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.Join(joinModel.friends, function (p) {
                            return p.firstName;
                        }, function (f) {
                            return f.firstName;
                        }, function (p, f) {
                            return { person: p, friend: f };
                        }, "not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("outer sequence is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.Join(joinModel.friends, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friend: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("inner sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.Join(array, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friend: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("without matching elements, returns empty array", function () {
                    //Act
                    var result = viewModel.people.Join(joinModel.friends,
                        function (p) { return p.lastName; },
                        function (f) { return f.lastName; },
                        function (p, f) { return { person: p, friend: f }; },
                        function (k1, k2) {
                            return k1.length === 1;
                        });
                    
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("with matching elements, returns matched elements", function () {
                    //Act
                    var result = viewModel.people.Join(joinModel.friends, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friend: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(6);
                });

                it("with matching elements, returns matched elements", function () {
                    //Act
                    var result = viewModel.people.Join(joinModel.friends, function (p) {
                        return p.firstName;
                    }, function (f) {
                        return f.firstName;
                    }, function (p, f) {
                        return { person: p, friend: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(6);
                });

            });

            describe("with multi key selectors and without equalityComparer", function () {

                it("outer sequence is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.Join(joinModel.friends, function (p) {
                        return { fn: p.firstName, ln: p.lastName };
                    }, function (f) {
                        return { fn: f.firstName, ln: f.lastName };
                    }, function (p, f) {
                        return { person: p, friend: f };
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("inner sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.Join(array, function (p) {
                        return { fn: p.firstName, ln: p.lastName };
                    }, function (f) {
                        return { fn: f.firstName, ln: f.lastName };
                    }, function (p, f) {
                        return { person: p, friend: f };
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("without matching elements, returns empty array", function () {
                    //Act
                    var result = viewModel.people.Join(joinModel.friends,
                        function (p) { return { fn: p.firstName, ln: p.lastName }; },
                        function (f) { return { fn: f.firstName, ln: f.lastName }; },
                        function (p, f) { return { person: p, friend: f }; }
                    );
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("with matching elements, returns matched elements", function () {
                    //Arrange
                    var array = [];
                    array.push(viewModel.people()[0]);
                    array.push(viewModel.people()[3]);
                    //Act
                    var result = viewModel.people.Join(array,
                        function (p) { return { fn: p.firstName, ln: p.lastName }; },
                        function (f) { return { fn: f.firstName, ln: f.lastName }; },
                        function (p, f) { return { person: p, friend: f }; }
                    );
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].person.firstName).toBe("Nifty");
                    expect(result[0].friend.firstName).toBe("Nifty");
                    expect(result[1].person.firstName).toBe("Ryan");
                    expect(result[1].friend.firstName).toBe("Ryan");
                });
            });

            describe("with multi key selectors and with equalityComparer", function () {

                it("outer sequence is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.Join(joinModel.friends, function (p) {
                        return { fn: p.firstName, ln: p.lastName };
                    }, function (f) {
                        return { fn: f.firstName, ln: f.lastName };
                    }, function (p, f) {
                        return { person: p, friend: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("inner sequence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = viewModel.people.Join(array, function (p) {
                        return { fn: p.firstName, ln: p.lastName };
                    }, function (f) {
                        return { fn: f.firstName, ln: f.lastName };
                    }, function (p, f) {
                        return { person: p, friend: f };
                    },
                    function (k1, k2) {
                        return k1.length === k2.length;
                    });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("without matching elements, returns empty array", function () {
                    //Act
                    var result = viewModel.people.Join(joinModel.friends,
                        function (p) { return { fn: p.firstName, ln: p.lastName }; },
                        function (f) { return { fn: f.firstName, ln: f.lastName }; },
                        function (p, f) { return { person: p, friend: f }; },
                        function (k1, k2) { return k1.fn === k2.fn && k1.ln === k2.ln; }
                    );
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("with matching elements, returns matched elements", function () {
                    //Arrange
                    var array = [];
                    array.push(viewModel.people()[0]);
                    array.push(viewModel.people()[3]);
                    //Act
                    var result = viewModel.people.Join(array,
                        function (p) { return { fn: p.firstName, ln: p.lastName }; },
                        function (f) { return { fn: f.firstName, ln: f.lastName }; },
                        function (p, f) { return { person: p, friend: f }; },
                        function (k1, k2) { return k1.fn === k2.fn && k1.ln === k2.ln; }
                    );
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].person.firstName).toBe("Nifty");
                    expect(result[0].friend.firstName).toBe("Nifty");
                    expect(result[1].person.firstName).toBe("Ryan");
                    expect(result[1].friend.firstName).toBe("Ryan");
                });
            });

        });

        //#endregion

        //#region L

        describe(".Last", function () {

            it("with no predicate and empty array, throws InvalidOperationException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.Last();
                }).toThrowError("InvalidOperationException: The sequence contains no elements")
            });

            it("with predicate and empty array, throws InvalidOperationException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.Last(function (p) { return p.id > 2; });
                }).toThrowError("InvalidOperationException: The sequence contains no elements")
            });

            it("with no predicate, returns last element", function () {
                var person = viewModel.people.Last();
                expect(person.firstName).toBe("Jon");
            });

            it("with predicate, returns last matching element", function () {
                var person = viewModel.people.Last(function (p) {
                    return p.id < 4;
                });
                expect(person.firstName).toBe("Steven");
            });

            it("with wrong predicate, throws InvalidOperationException", function () {
                expect(function () {
                    var person = viewModel.people.Last(function (p) {
                        return p.id > 200;
                    });
                }).toThrowError("InvalidOperationException: The sequence contains no matching element")
            });

        });

        describe(".LastOrDefault", function () {

            it("with no predicate and empty array, returns null", function () {
                var array = ko.observableArray();
                var person = array.LastOrDefault();
                expect(person).toBe(null);
            });

            it("with predicate and empty array, returns null", function () {
                var array = ko.observableArray();
                var person = array.LastOrDefault(function (p) { return p.id > 2; });
                expect(person).toBe(null);
            });

            it("with no predicate, returns last element", function () {
                var person = viewModel.people.LastOrDefault();
                expect(person.firstName).toBe("Jon");
            });

            it("with predicate, returns last matching element", function () {
                var person = viewModel.people.LastOrDefault(function (p) {
                    return p.id < 4;
                });
                expect(person.firstName).toBe("Steven");
            });

            it("with wrong predicate, returns null", function () {
                var person = viewModel.people.LastOrDefault(function (p) {
                    return p.id > 200;
                });
                expect(person).toBe(null);
            });

        });

        describe(".LongCount", function () {

            it("with no argument, returns number of list elements", function () {
                var i = viewModel.people.LongCount();
                expect(i).toBe(5);
            });

            it("with argument, returns number of matching elements", function () {
                var i = viewModel.people.LongCount(function (p) {
                    return p.id > 3;
                });
                expect(i).toBe(2);
            });

            it("with no matching predicate, returns zero", function () {
                var i = viewModel.people.LongCount(function (p) {
                    return p.id < 0;
                });
                expect(i).toBe(0);
            });
        });

        //#endregion

        //#region M

        describe(".Max", function () {

            it("with no selector and empty array, throws ArgumentNullException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.Max();
                }).toThrowError("ArgumentNullException: Missing selector");
            });

            it("with selector and empty array, throws InvalidOperationException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.Max(function (p) { return p.id > 2; });
                }).toThrowError("InvalidOperationException: The sequence contains no elements")
            });


            it("with no selector, throws an ArgumentNullException", function () {
                expect(function () {
                    var avg = viewModel.people.Max();
                }).toThrowError("ArgumentNullException: Missing selector");
            });

            it("returns max value", function () {
                var avg = viewModel.people.Max(function (p) {
                    return p.id;
                });
                expect(avg).toBe(5);
            });

            it("returns max negative value", function () {
                ko.utils.arrayForEach(viewModel.people(), function (item) {
                    item.id = item.id * -1;
                });

                var avg = viewModel.people.Max(function (p) {
                    return p.id;
                });
                expect(avg).toBe(-1);
            });
        });

        describe(".Min", function () {

            it("with no selector and empty array, throws ArgumentNullException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.Min();
                }).toThrowError("ArgumentNullException: Missing selector");
            });

            it("with selector and empty array, throws InvalidOperationException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var person = array.Min(function (p) { return p.id > 2; });
                }).toThrowError("InvalidOperationException: The sequence contains no elements")
            });


            it("with no selector, throws an ArgumentNullException", function () {
                expect(function () {
                    var avg = viewModel.people.Min();
                }).toThrowError("ArgumentNullException: Missing selector");
            });

            it("returns min value", function () {
                var avg = viewModel.people.Min(function (p) {
                    return p.id;
                });
                expect(avg).toBe(1);
            });

            it("returns min negative value", function () {
                ko.utils.arrayForEach(viewModel.people(), function (item) {
                    item.id = item.id * -1;
                });

                var avg = viewModel.people.Min(function (p) {
                    return p.id;
                });
                expect(avg).toBe(-5);
            });
        });

        //#endregion

        //#region O

        describe(".OfType", function () {

            var array = [];
            beforeEach(function () {
                array = ko.observableArray(['string1', 1, { id: 1, firstName: 'Nifty', lastName: 'Code' }, [], 'string2', function () { return 1; }, 2, true, 7.5, false, 3.5]);
            });

            it("without argument, throws ArgumentNullException", function () {
                //Arrange
                var array = ko.observableArray([]);
                //Act
                expect(function () {
                    var person = array.OfType();
                }).toThrowError("ArgumentNullException: Missing TResult"); //Assert
            });

            it("requested type is unknown, throws TypeLoadException", function () {
                //Arrange
                var array = ko.observableArray([]);
                //Act
                expect(function () {
                    var result = array.OfType("unknownType");
                }).toThrowError("TypeLoadException: Argument TResult is an unknown type. Please extend the tinylinq.typeValidators!"); //Assert
            });

            it("input sequence is empty, returns empty array", function () {
                //Arrange
                var array = ko.observableArray([]);
                //Act
                var result = array.OfType("string");
                //Assert
                expect(result.length).toBe(0);
            });

            it("input sequence has different element types and requested type is string, returns array requested type elements", function () {
                //Act
                var result = array.OfType("string");
                //Assert
                expect(result.length).toBe(2);
                expect(result[0]).toBe('string1');
                expect(result[1]).toBe('string2');
            });

            it("input sequence has different element types and requested type is int, returns array requested type elements", function () {
                //Act
                var result = array.OfType("int");
                //Assert
                expect(result.length).toBe(2);
                expect(result[0]).toBe(1);
                expect(result[1]).toBe(2);
            });

            it("input sequence has different element types and requested type is bool, returns array requested type elements", function () {
                //Act
                var result = array.OfType("bool");
                //Assert
                expect(result.length).toBe(2);
                expect(result[0]).toBe(true);
                expect(result[1]).toBe(false);
            });

            it("input sequence has different element types and requested type is float, returns array requested type elements", function () {
                //Act
                var result = array.OfType("float");
                //Assert
                expect(result.length).toBe(4);
                expect(result[0]).toBe(1); //ints are also valid floats
                expect(result[1]).toBe(2); //ints are also valid floats
                expect(result[2]).toBe(7.5);
                expect(result[3]).toBe(3.5);
            });

            it("input sequence has different element types and requested type is function, returns array requested type elements", function () {
                //Act
                var result = array.OfType("function");
                //Assert
                expect(result.length).toBe(1);
            });

            it("input sequence has different element types and requested type is array, returns array requested type elements", function () {
                //Act
                var result = array.OfType("array");
                //Assert
                expect(result.length).toBe(1);
                expect(result[0].length).toBe(0); //empty array
            });

            it("input sequence has different element types and requested type is object, returns array requested type elements", function () {
                //Act
                var result = array.OfType("object");
                //Assert
                expect(result.length).toBe(1);
                expect(result[0].id).toBe(1); //empty array
            });

            it("input sequence has different element types and requested type is custom (person), returns array requested type elements", function () {
                //Arrange
                tinylinq.typeValidators.person = function (p) {
                    return (p.id && p.firstName && p.lastName);
                };
                //Act
                var result = array.OfType("person");
                //Assert
                expect(result.length).toBe(1);
                expect(result[0].id).toBe(1); //empty array
            });
        });

        describe(".OrderBy", function () {

            it("without argument, throws ArgumentNullException", function () {
                //Act
                expect(function () {
                    var result = viewModel.people.OrderBy();
                }).toThrowError("ArgumentNullException: Missing keySelector"); //Assert
            });
            
            it("keySelector is not a function, throws TypeLoadException", function () {
                expect(function () {
                    var result = viewModel.people.OrderBy("Not a function");
                }).toThrowError("TypeLoadException: Argument keySelector is not a function");
            });

            describe("without comparer", function () {

                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    var keySelector = function (p) {
                        return p.firstName;
                    };
                    //Act
                    var result = array.OrderBy(keySelector);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[0].key).toBe(keySelector);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                });

                it("all input elements have different key, changes order", function () {
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Jon');
                    expect(result[1].firstName).toBe('Nifty');
                    expect(result[2].firstName).toBe('Ryan');
                    expect(result[3].firstName).toBe('Scott');
                    expect(result[4].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                });

                it("some input elements have different key, orders but preserves equal elements", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Skeet');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Galloway');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[5].firstName).toBe('Rob');
                    expect(result[6].firstName).toBe('Ryan');
                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Hanselman');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Guthrie');
                    expect(result[9].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                });

            });

            describe("with comparer", function () {

                var comparer = function (x, y) {
                    if (x.length < y.length)
                        return -1;
                    if (x.length > y.length)
                        return 1;
                    return 0;
                }

                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.OrderBy(function (p) {
                        return p.firstName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    }, function (x, y) {
                        if (x.key < y.key)
                            return -1;
                        if (x.key > y.key)
                            return 1;
                        return 0;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                });

                it("all input elements have different key, changes order", function () {
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Jon');
                    expect(result[1].firstName).toBe('Ryan');
                    expect(result[2].firstName).toBe('Nifty');
                    expect(result[3].firstName).toBe('Scott');
                    expect(result[4].firstName).toBe('Steven');
                    expect(result.SortKeys[0].comp).toBe(comparer);
                    expect(result.SortKeys[0].dir).toBe("asc");
                });

                it("some input elements have different key, orders but preserves equal elements", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Jon');
                    expect(result[0].lastName).toBe('Skeet');
                    expect(result[1].firstName).toBe('Rob');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Galloway');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Dave');
                    expect(result[5].firstName).toBe('Nifty');
                    expect(result[6].firstName).toBe('Scott');
                    expect(result[6].lastName).toBe('Hanselman');
                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Guthrie');
                    expect(result[8].firstName).toBe('Steven');
                    expect(result[9].firstName).toBe('Justin');
                    expect(result.SortKeys[0].comp).toBe(comparer);
                    expect(result.SortKeys[0].dir).toBe("asc");
                });

            });

        });

        describe(".OrderByDescending", function () {

            it("without argument, throws ArgumentNullException", function () {
                //Act
                expect(function () {
                    var result = viewModel.people.OrderByDescending();
                }).toThrowError("ArgumentNullException: Missing keySelector"); //Assert
            });

            it("keySelector is not a function, throws TypeLoadException", function () {
                expect(function () {
                    var result = viewModel.people.OrderByDescending("Not a function");
                }).toThrowError("TypeLoadException: Argument keySelector is not a function");
            });

            describe("without comparer", function () {

                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    var keySelector = function (p) {
                        return p.firstName;
                    };
                    //Act
                    var result = array.OrderByDescending(keySelector);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("desc");
                    expect(result.SortKeys[0].key).toBe(keySelector);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderByDescending(function (p) {
                        return p.key;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("desc");
                });

                it("all input elements have different key, changes order", function () {
                    //Act
                    var result = viewModel.people.OrderByDescending(function (p) {
                        return p.firstName;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Steven');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Ryan');
                    expect(result[3].firstName).toBe('Nifty');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("desc");
                });

                it("some input elements have different key, orders but preserves equal elements", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderByDescending(function (p) {
                        return p.firstName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Steven');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[1].lastName).toBe('Hanselman');
                    expect(result[2].firstName).toBe('Scott');
                    expect(result[2].lastName).toBe('Guthrie');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Rob');
                    expect(result[5].firstName).toBe('Nifty');
                    expect(result[6].firstName).toBe('Justin');
                    expect(result[7].firstName).toBe('Jon');
                    expect(result[7].lastName).toBe('Skeet');
                    expect(result[8].firstName).toBe('Jon');
                    expect(result[8].lastName).toBe('Galloway');
                    expect(result[9].firstName).toBe('Dave');
                    expect(result.SortKeys[0].dir).toBe("desc");
                });

            });

            describe("with comparer", function () {

                var comparer = function (x, y) {
                    if (x.length < y.length)
                        return 1;
                    if (x.length > y.length)
                        return -1;
                    return 0;
                }

                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.OrderByDescending(function (p) {
                        return p.firstName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].comp).toBe(comparer);
                    expect(result.SortKeys[0].dir).toBe("desc");
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderByDescending(function (p) {
                        return p.key;
                    }, function (x, y) {
                        if (x.key < y.key)
                            return 1;
                        if (x.key > y.key)
                            return -1;
                        return 0;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("desc");
                });

                it("all input elements have different key, changes order", function () {
                    //Act
                    var result = viewModel.people.OrderByDescending(function (p) {
                        return p.firstName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Steven');
                    expect(result[1].firstName).toBe('Nifty');
                    expect(result[2].firstName).toBe('Scott');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].comp).toBe(comparer);
                    expect(result.SortKeys[0].dir).toBe("desc");
                });

                it("some input elements have different key, orders but preserves equal elements", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderByDescending(function (p) {
                        return p.firstName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Steven');
                    expect(result[1].firstName).toBe('Justin');
                    expect(result[2].firstName).toBe('Nifty');
                    expect(result[3].firstName).toBe('Scott');
                    expect(result[3].lastName).toBe('Hanselman');
                    expect(result[4].firstName).toBe('Scott');
                    expect(result[4].lastName).toBe('Guthrie');
                    expect(result[5].firstName).toBe('Ryan');
                    expect(result[6].firstName).toBe('Dave');
                    expect(result[7].firstName).toBe('Jon');
                    expect(result[7].lastName).toBe('Skeet');
                    expect(result[8].firstName).toBe('Rob');
                    expect(result[9].firstName).toBe('Jon');
                    expect(result[9].lastName).toBe('Galloway');
                    expect(result.SortKeys[0].comp).toBe(comparer);
                    expect(result.SortKeys[0].dir).toBe("desc");
                });

            });
        });

        //#endregion

        //#region R

        describe(".Range (WILL NOT BE IMPLEMENTED)", function () {

            it("check that it does not exist, throws an Error", function () {
                expect(function () {
                    var person = viewModel.people.Range();
                }).toThrowError();
            });

            //it("without argument, throws ArgumentNullException", function () {
            //    expect(function () {
            //        var person = viewModel.people.Range();
            //    }).toThrowError("ArgumentNullException: Missing start");
            //});

            //it("start argument is not an integer, throws TypeLoadException", function () {
            //    expect(function () {
            //        var person = viewModel.people.Range("hello", 3);
            //    }).toThrowError("TypeLoadException: Argument start is not an integer");
            //});

            //it("without count argument, throws ArgumentNullException", function () {
            //    expect(function () {
            //        var person = viewModel.people.Range(5);
            //    }).toThrowError("ArgumentNullException: Missing count");
            //});

            //it("count argument is not an integer, throws TypeLoadException", function () {
            //    expect(function () {
            //        var person = viewModel.people.Range(5, "hello");
            //    }).toThrowError("TypeLoadException: Argument start is not an integer");
            //});

        });

        describe(".Repeat (WILL NOT BE IMPLEMENTED)", function () {

            it("check that it does not exist, throws an Error", function () {
                expect(function () {
                    var person = viewModel.people.Repeat();
                }).toThrowError();
            });

        });

        describe(".Reverse", function () {
            //Is the standard implementation immutable

            it("empty input array, returns empty observableArray", function () {
                //Arrange
                viewModel.people.removeAll();
                //Act
                var result = viewModel.people.Reverse();
                //Assert
                expect(result.length).toBe(0);
            });

            it("reverse the input array, returns reversed observableArray", function () {
                //Act
                var result = viewModel.people.Reverse();
                //Assert
                expect(result[0].firstName).toBe("Jon");
                expect(result[4].firstName).toBe("Nifty");
            });

        });

        //#endregion

        //#region S

        describe(".Select", function () {

            it("with no selector, returns whole array", function () {
                var result = viewModel.people.Select();

                expect(result.length).toBe(5);
                expect(result[0].id).toBe(viewModel.people()[0].id);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("with selector, returns mapped array", function () {
                var result = viewModel.people.Select(function (p) {
                    return { No: p.id, Name: p.firstName + " " + p.lastName };
                });

                expect(result.length).toBe(viewModel.people().length);
                expect(result[0].No).toBe(viewModel.people()[0].id);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("with selector which acceptes index parameter, returns mapped array", function () {
                var result = viewModel.people.Select(function (p, i) {
                    return { No: (10 - i), Name: p.firstName + " " + p.lastName };
                });

                expect(result.length).toBe(viewModel.people().length);
                expect(result[0].No).toBe(10);
                expect(result[3].No).toBe(7);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

        });

        describe(".SelectMany", function () {

            it("with no collectionSelector, throws an ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.SelectMany();
                }).toThrowError("ArgumentNullException: Missing collectionsSelector");
            });

            describe("with collectionSelector, without resultSelector", function () {

                it("and selection is not an array structure, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.SelectMany(function (p) {
                            return p.id;
                        });
                    }).toThrowError("TypeLoadException: The collectionsSelector does not return an array");
                });

                it("returns flat array of objects", function () {
                    //Act
                    var result = viewModel.people.SelectMany(function (p) {
                        return p.friends;
                    });

                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe("Rob");
                    //Check that original Array(s) have not been mutated
                    expect(viewModel.people().length).toBe(5);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });

                it("and index parameter is expected, returns flat array of objects", function () {
                    //Act
                    var result = viewModel.people.SelectMany(function (p, index) {
                        console.log(index);
                        return p.friends;
                    });

                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe("Rob");
                    //Check that original Array(s) have not been mutated
                    expect(viewModel.people().length).toBe(5);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });

                it("but one subArray is null, throws a TypeLoadException", function () {
                    // Arrange
                    viewModel.people()[3].friends = null;

                    //Act / Assert
                    expect(function () {
                        viewModel.people.SelectMany(function (p) {
                            return p.friends;
                        });
                    }).toThrowError("TypeLoadException: The collectionsSelector does not return an array");
                });

                it("but one subArray is undefined, throws a TypeLoadException", function () {
                    // Arrange
                    delete viewModel.people()[3].friends;

                    //Act / Assert
                    expect(function () {
                        viewModel.people.SelectMany(function (p) {
                            return p.friends;
                        });
                    }).toThrowError("TypeLoadException: The collectionsSelector does not return an array");
                });

                it("but no one has a sub element, returns empty array", function () {
                    //Arrange
                    viewModel.people()[0].friends = [];
                    viewModel.people()[1].friends = [];

                    //Act
                    var result = viewModel.people.SelectMany(function (p) {
                        return p.friends;
                    });

                    //Assert
                    expect(result.length).toBe(0);
                    //Check that original Array(s) have not been mutated
                    expect(viewModel.people().length).toBe(5);
                    expect(viewModel.people()[0].friends.length).toBe(0);
                    expect(viewModel.people()[0].friends.length).toBe(0);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });

                it("but sub elements are plain strings, returns array of Strings", function () {
                    //Arrange
                    viewModel.people()[0].friends = ["Rob", "Jon", "Steve"];
                    viewModel.people()[1].friends = ["Scott", "Scott", "Scott"];

                    //Act
                    var result = viewModel.people.SelectMany(function (p) {
                        return p.friends;
                    });

                    //Assert
                    expect(result.length).toBe(6);
                    expect(result[0]).toBe("Rob");
                    //Check that original Array(s) have not been mutated
                    expect(viewModel.people().length).toBe(5);
                    expect(viewModel.people()[0].friends.length).toBe(3);
                    expect(viewModel.people()[0].friends.length).toBe(3);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });


                it("and sub array is an array, returns flat array of objects", function () {
                    //Arrange
                    viewModel.people()[0].friends = ko.observableArray(viewModel.people()[0].friends);
                    viewModel.people()[1].friends = ko.observableArray(viewModel.people()[1].friends);

                    //Act
                    var result = viewModel.people.SelectMany(function (p) {
                        return p.friends;
                    });

                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe("Rob");
                    //Check that original Array(s) have not been mutated
                    expect(viewModel.people().length).toBe(5);
                    expect(viewModel.people()[0].friends().length).toBe(3);
                    expect(viewModel.people()[0].friends().length).toBe(3);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });
            });

            describe("with collectionSelector, with resultSelector", function () {
                it("returns flat array of anonymuous objects", function () {
                    //Act
                    var result = viewModel.people.SelectMany(
                                        function (p) { return p.friends; },
                                        function (p, f) { return { text: f.firstName + " is friend of " + p.firstName } });

                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].text).toBe("Rob is friend of Nifty");
                    //Check that original Array(s) have not been mutated
                    expect(viewModel.people().length).toBe(5);
                    expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                });
            });

        });

        describe(".SequenceEqual", function () {

            it("without second argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.SequenceEqual();
                }).toThrowError("ArgumentNullException: Missing second");
            });

            describe("without equalityComparer", function () {

                it("second array has different length then original, returns false", function () {
                    //Arrange
                    var secondArray = ko.observableArray([]);
                    for (var i = 0; i < viewModel.people()[0].friends.length; i++) {
                        secondArray.push(viewModel.people()[0].friends[i]);
                    }
                    //Act
                    var bool = viewModel.people.SequenceEqual(secondArray);
                    //Assert
                    expect(bool).toBe(false);
                });

                it("second points to original, returns true", function () {
                    //Arrange
                    var secondArray = viewModel.people;
                    //Act
                    var bool = viewModel.people.SequenceEqual(secondArray);
                    //Assert
                    expect(bool).toBe(true);
                });

                it("second has the same elements but is a different array, returns true", function () {
                    //Arrange
                    var secondArray = ko.observableArray();
                    for (var i = 0; i < viewModel.people().length; i++) {
                        secondArray.push(viewModel.people()[i]);
                    }
                    //Act
                    var bool = viewModel.people.SequenceEqual(secondArray);
                    //Assert
                    expect(bool).toBe(true);
                });

                it("second has same length but different elements, returns false", function () {
                    //Arrange
                    var secondArray = ko.observableArray();
                    for (var j = 0; j < 2; j++) {
                        for (var i = 0; i < viewModel.people()[j].friends.length; i++) {
                            var currentFriend = viewModel.people()[j].friends[i];
                            secondArray.push(currentFriend);
                        }
                    }
                    //Act
                    var bool = viewModel.people.SequenceEqual(secondArray);
                    //Assert
                    expect(bool).toBe(false);
                });

            });

            describe("with equalityComparer", function () {

                it("but equalityComparer is not a function, throws TypeLoadException", function () {
                    //Arrange
                    var secondArray = viewModel.people;

                    //Act / Assert
                    expect(function () {
                        viewModel.people.SequenceEqual(secondArray, "not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("second array has different length then original, returns false", function () {
                    //Arrange
                    var secondArray = ko.observableArray([]);
                    for (var i = 0; i < viewModel.people()[0].friends.length; i++) {
                        secondArray.push(viewModel.people()[0].friends[i]);
                    }
                    //Act
                    var bool = viewModel.people
                                        .SequenceEqual(secondArray,
                                            function (p1, p2) { return p1.firstName == p1.firstName; });
                    //Assert
                    expect(bool).toBe(false);
                });

                it("second points to original, returns true", function () {
                    //Arrange
                    var secondArray = viewModel.people;
                    //Act
                    var bool = viewModel.people.SequenceEqual(secondArray,
                                            function (p1, p2) { return p1.firstName == p1.firstName; });
                    //Assert
                    expect(bool).toBe(true);
                });

                it("second has the same elements but is a different array, returns true", function () {
                    //Arrange
                    var secondArray = ko.observableArray();
                    for (var i = 0; i < viewModel.people().length; i++) {
                        secondArray.push(viewModel.people()[i]);
                    }
                    //Act
                    var bool = viewModel.people.SequenceEqual(secondArray,
                                            function (p1, p2) { return p1.firstName == p1.firstName; });
                    //Assert
                    expect(bool).toBe(true);
                });

                it("second has the same elements but is a different array and without a comparer, returns true", function () {
                    //Arrange
                    var secondArray = ko.observableArray();
                    for (var i = 0; i < viewModel.people().length; i++) {
                        secondArray.push(viewModel.people()[i]);
                    }
                    //Act
                    var bool = viewModel.people.SequenceEqual(secondArray,
                                            function (p1, p2) { return p1.firstName == p1.lastName; });
                    //Assert
                    expect(bool).toBe(false);
                });

                it("second has same length but different elements, returns false", function () {
                    //Arrange
                    var secondArray = ko.observableArray();
                    for (var j = 0; j < 2; j++) {
                        for (var i = 0; i < viewModel.people()[j].friends.length; i++) {
                            var currentFriend = viewModel.people()[j].friends[i];
                            secondArray.push(currentFriend);
                        }
                    }
                    //Act
                    var bool = viewModel.people.SequenceEqual(secondArray, function (p1, p2) { return p1 === p2; });
                    //Assert
                    expect(bool).toBe(false);
                });
            });

        });

        describe(".SingleOrDefault", function () {

            describe("without predicate", function () {

                it("and empty array, returns null", function () {
                    var array = ko.observableArray();
                    var person = array.SingleOrDefault();
                    expect(person).toBe(null);
                });

                it("and array has more than one entries, throw InvalidOperationException", function () {
                    expect(function () {
                        viewModel.people.SingleOrDefault();
                    }).toThrowError("InvalidOperationException: The sequence contains more than one element");
                });

                it("and array has exact one entry, returns entry", function () {
                    var ary = ko.observableArray([]);
                    ary().push(viewModel.people()[0]);
                    var person = ary.SingleOrDefault();
                    expect(person.firstName).toBe("Nifty");
                });

            });

            describe("with predicate", function () {

                it("and empty array, returns null", function () {
                    var array = ko.observableArray();
                    var person = array.SingleOrDefault(function (p) { return p.id > 2; });
                    expect(person).toBe(null);
                });

                it("and it has more than one matching entries, throw InvalidOperationException", function () {
                    expect(function () {
                        viewModel.people.SingleOrDefault(function (p) { return p.id < 4; });
                    }).toThrowError("InvalidOperationException: The sequence contains more than one element");
                });

                it("and array has exact one entry which matches, returns entry", function () {
                    var ary = ko.observableArray([]);
                    ary().push(viewModel.people()[0]);
                    var person = ary.SingleOrDefault(function (p) { return p.id < 2; });
                    expect(person.firstName).toBe("Nifty");
                });

                it("and array has multiple entries but only one matches, returns entry", function () {
                    var person = viewModel.people.SingleOrDefault(function (p) { return p.id < 2; });
                    expect(person.firstName).toBe("Nifty");
                });

                it("and array has multiple entries but no one matches, returns null", function () {
                    var person = viewModel.people.SingleOrDefault(function (p) { return p.id > 200; });
                    expect(person).toBe(null);
                });

            });

        });

        describe(".Single", function () {

            describe("without predicate", function () {

                it("and empty array, throw InvalidOperationException", function () {
                    //Arrange
                    var array = ko.observableArray();

                    //Act / Assert
                    expect(function () {
                        array.Single();
                    }).toThrowError("InvalidOperationException: The sequence contains no matching element");
                });

                it("and array has more than one entries, throw InvalidOperationException", function () {
                    expect(function () {
                        viewModel.people.Single();
                    }).toThrowError("InvalidOperationException: The sequence contains more than one element");
                });

                it("and array has exact one entry, returns entry", function () {
                    var ary = ko.observableArray([]);
                    ary().push(viewModel.people()[0]);
                    var person = ary.Single();
                    expect(person.firstName).toBe("Nifty");
                });

            });

            describe("with predicate", function () {

                it("and empty array, throw InvalidOperationException", function () {
                    //Arrange
                    var array = ko.observableArray();

                    //Act / Assert
                    expect(function () {
                        array.Single(function (p) { return p.id > 2; });
                    }).toThrowError("InvalidOperationException: The sequence contains no matching element");
                });

                it("and it has more than one matching entries, throw InvalidOperationException", function () {
                    expect(function () {
                        viewModel.people.Single(function (p) { return p.id < 4; });
                    }).toThrowError("InvalidOperationException: The sequence contains more than one element");
                });

                it("and array has exact one entry which matches, returns entry", function () {
                    var ary = ko.observableArray([]);
                    ary().push(viewModel.people()[0]);
                    var person = ary.Single(function (p) { return p.id < 2; });
                    expect(person.firstName).toBe("Nifty");
                });

                it("and array has multiple entries but only one matches, returns entry", function () {
                    var person = viewModel.people.SingleOrDefault(function (p) { return p.id < 2; });
                    expect(person.firstName).toBe("Nifty");
                });

                it("and array has multiple entries but no one matches, returns throw InvalidOperationException", function () {
                    expect(function () {
                        viewModel.people.Single(function (p) { return p.id > 200; });
                    }).toThrowError("InvalidOperationException: The sequence contains no matching element");
                });

            });
        });

        describe(".Skip", function () {

            it("without count argument, throws ArgumentNullException", function () {
                expect(function () {
                    var person = viewModel.people.Skip();
                }).toThrowError("ArgumentNullException: Missing count");
            });

            it("count argument is not an integer, throws TypeLoadException", function () {
                expect(function () {
                    var person = viewModel.people.Skip("hello");
                }).toThrowError("TypeLoadException: Argument count is not an int");
            });

            it("count is zero, returns complete observableArray", function () {
                //Act
                var result = viewModel.people.Skip(0);

                //Assert
                expect(result.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("count is equal to the length of the observableArray, returns empty observableArray", function () {
                //Act
                var result = viewModel.people.Skip(5);

                //Assert
                expect(result.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("count is greater than the length of the observableArray, returns empty observableArray", function () {
                //Act
                var result = viewModel.people.Skip(1000);

                //Assert
                expect(result.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("count is lower than zero, returns complete observableArray", function () {
                //Act
                var result = viewModel.people.Skip(-1);

                //Assert
                expect(result.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("count is lower than length of the observableArray, returns partial observableArray", function () {
                //Act
                var result = viewModel.people.Skip(2);

                //Assert
                expect(result.length).toBe(3);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

        });

        describe(".SkipWhile", function () {

            it("without predicate argument, throws ArgumentNullException", function () {
                expect(function () {
                    var person = viewModel.people.SkipWhile();
                }).toThrowError("ArgumentNullException: Missing predicate");
            });

            it("predicate argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    var person = viewModel.people.SkipWhile("hello");
                }).toThrowError("TypeLoadException: Argument predicate is not a function");
            });

            it("predicate argument has no match, returns empty observableArray", function () {
                //Act
                var result = viewModel.people.SkipWhile(function (p) { return p.id < 100; });

                //Assert
                expect(result.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("predicate argument matches first element, returns complete observableArray", function () {
                //Act
                var result = viewModel.people.SkipWhile(function (p) { return p.id < 0; });

                //Assert
                expect(result.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

        });

        describe(".Sum", function () {
            it("with no selector and empty array, throws ArgumentNullException", function () {
                var array = ko.observableArray();
                expect(function () {
                    var sum = array.Sum();
                }).toThrowError("ArgumentNullException: Missing selector");
            });

            it("with no selector, throws an ArgumentNullException", function () {
                expect(function () {
                    var sum = viewModel.people.Sum();
                }).toThrowError("ArgumentNullException: Missing selector");
            });

            it("selector argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    var sum = viewModel.people.Sum("hello");
                }).toThrowError("TypeLoadException: Argument selector is not a function");
            });

            it("with selector and empty array, returns zero", function () {
                var array = ko.observableArray();
                var sum = array.Sum(function (p) { return p.id > 2; });
                expect(sum).toBe(0);
            });

            it("with selector, returns integer", function () {
                var sum = viewModel.people.Sum(function (p) { return p.id; });
                expect(sum).toBe(15);
            });

            it("with selector, returns float", function () {
                viewModel.people.push({ id: 6.5, firstName: 'Rob', lastName: "Connery" });
                var sum = viewModel.people.Sum(function (p) { return p.id; });
                expect(sum).toBe(21.5);
            });

        });

        //#endregion

        //#region T

        describe(".Take", function () {

            it("without count argument, throws ArgumentNullException", function () {
                expect(function () {
                    var person = viewModel.people.Take();
                }).toThrowError("ArgumentNullException: Missing count");
            });

            it("count argument is not an integer, throws TypeLoadException", function () {
                expect(function () {
                    var person = viewModel.people.Take("hello");
                }).toThrowError("TypeLoadException: Argument count is not an int");
            });

            it("count is zero, returns empty array", function () {
                //Act
                var result = viewModel.people.Take(0);

                //Assert
                expect(result.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("count is equal to the length of the array, returns complete array", function () {
                //Act
                var result = viewModel.people.Take(5);

                //Assert
                expect(result.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("count is greater than the length of the array, returns complete array", function () {
                //Act
                var result = viewModel.people.Take(1000);

                //Assert
                expect(result.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("count is lower than zero, returns empty array", function () {
                //Act
                var result = viewModel.people.Take(-1);

                //Assert
                expect(result.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("count is lower than length of the array, returns partial array", function () {
                //Act
                var result = viewModel.people.Take(2);

                //Assert
                expect(result.length).toBe(2);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

        });

        describe(".TakeWhile", function () {

            it("without predicate argument, throws ArgumentNullException", function () {
                expect(function () {
                    var person = viewModel.people.TakeWhile();
                }).toThrowError("ArgumentNullException: Missing predicate");
            });

            it("predicate argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    var person = viewModel.people.TakeWhile("hello");
                }).toThrowError("TypeLoadException: Argument predicate is not a function");
            });

            it("predicate argument has no match, returns complete observableArray", function () {
                //Act
                var result = viewModel.people.TakeWhile(function (p) { return p.id < 100; });

                //Assert
                expect(result.length).toBe(5);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("predicate argument matches first element, returns empty observableArray", function () {
                //Act
                var result = viewModel.people.TakeWhile(function (p) { return p.id < 0; });

                //Assert
                expect(result.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });
        });

        describe(".ThenBy", function () {

            it("without OrderBy called, throws InvalidOperationException", function () {
                //Act
                expect(function () {
                    var result = viewModel.people.ThenBy();
                }).toThrowError("InvalidOperationException: ThenBy can not be called without OrderBy"); //Assert
            });

            it("without argument, throws ArgumentNullException", function () {
                //Arrange
                var keySelector = function (p) {
                    return p.firstName;
                };
                //Act
                expect(function () {
                    var result = viewModel.people.OrderBy(keySelector)
                                                 .ThenBy();
                }).toThrowError("ArgumentNullException: Missing keySelector"); //Assert
            });

            it("keySelector is not a function, throws TypeLoadException", function () {
                //Arrange
                var keySelector = function (p) {
                    return p.firstName;
                };
                expect(function () {
                    var result = viewModel.people.OrderBy(keySelector)
                                                 .ThenBy("Not a function");
                }).toThrowError("TypeLoadException: Argument keySelector is not a function");
            });

            describe("one ThenBy call, without comparer", function () {

                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    var orderbyKeySelector = function (p) {
                        return p.firstName;
                    };
                    var thenbyKeySelector = function (p) {
                        return p.lastName;
                    };
                    //Act
                    var result = array.OrderBy(orderbyKeySelector)
                                      .ThenBy(thenbyKeySelector);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[0].key).toBe(orderbyKeySelector);
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[1].key).toBe(thenbyKeySelector);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenBy(function (p) {
                        return p.key;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                });

                it("all input elements have different ThenBy key, changes order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenBy(function (p) {
                        return p.firstName;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Jon');
                    expect(result[1].firstName).toBe('Nifty');
                    expect(result[2].firstName).toBe('Ryan');
                    expect(result[3].firstName).toBe('Scott');
                    expect(result[4].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                });

                it("all input elements have different key (OrderBy and ThenBy keys), changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    })
                    .ThenBy(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Galloway');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Skeet');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[5].firstName).toBe('Rob');
                    expect(result[6].firstName).toBe('Ryan');
                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Guthrie');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Hanselman');
                    expect(result[9].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                });

                it("some input elements have different key (OrderBy and ThenBy keys), changes order but preserves order of equal elements", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    viewModel.people.push({ id: 11, firstName: 'Nifty', lastName: "Code", friends: [] });
                    viewModel.people.push({ id: 12, firstName: 'Scott', lastName: "Hanselman", friends: [] });

                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    })
                    .ThenBy(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(12);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Galloway');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Skeet');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[4].id).toBe(1);
                    expect(result[5].firstName).toBe('Nifty');
                    expect(result[5].id).toBe(11);
                    expect(result[6].firstName).toBe('Rob');
                    expect(result[7].firstName).toBe('Ryan');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Guthrie');
                    expect(result[9].firstName).toBe('Scott');
                    expect(result[9].lastName).toBe('Hanselman');
                    expect(result[9].id).toBe(2);
                    expect(result[10].firstName).toBe('Scott');
                    expect(result[10].lastName).toBe('Hanselman');
                    expect(result[10].id).toBe(12);
                    expect(result[11].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                });

            });

            describe("one ThenBy call, with comparer", function () {

                var comparer = function (x, y) {
                    if (x.length < y.length)
                        return -1;
                    if (x.length > y.length)
                        return 1;
                    return 0;
                }

                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    var orderbyKeySelector = function (p) {
                        return p.firstName;
                    };
                    var thenbyKeySelector = function (p) {
                        return p.lastName;
                    };
                    //Act
                    var result = array.OrderBy(orderbyKeySelector)
                                      .ThenBy(thenbyKeySelector, comparer);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[0].key).toBe(orderbyKeySelector);
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[1].key).toBe(thenbyKeySelector);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenBy(function (p) {
                        return p.key;
                    }, function (x, y) {
                        if (x.key < y.key)
                            return -1;
                        if (x.key > y.key)
                            return 1;
                        return 0;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                });

                it("all input elements have different ThenBy key, changes order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenBy(function (p) {
                        return p.firstName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Jon');
                    expect(result[1].firstName).toBe('Ryan');
                    expect(result[2].firstName).toBe('Nifty');
                    expect(result[3].firstName).toBe('Scott');
                    expect(result[4].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].comp).toBe(comparer);
                    expect(result.SortKeys[1].dir).toBe("asc");
                });

                it("some input elements have different key (OrderBy and ThenBy keys), changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    })
                    .ThenBy(function (p) {
                        return p.lastName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Skeet');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Galloway');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[5].firstName).toBe('Rob');
                    expect(result[6].firstName).toBe('Ryan');
                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Guthrie');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Hanselman');
                    expect(result[9].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[1].comp).toBe(comparer);
                });

                it("some input elements have different key (OrderBy and ThenBy keys), changes order but preserves order of equal elements", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    viewModel.people.push({ id: 11, firstName: 'Nifty', lastName: "Code", friends: [] });
                    viewModel.people.push({ id: 12, firstName: 'Scott', lastName: "Hanselman", friends: [] });

                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    })
                    .ThenBy(function (p) {
                        return p.lastName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(12);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Skeet');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Galloway');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[4].id).toBe(1);
                    expect(result[5].firstName).toBe('Nifty');
                    expect(result[5].id).toBe(11);
                    expect(result[6].firstName).toBe('Rob');
                    expect(result[7].firstName).toBe('Ryan');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Guthrie');
                    expect(result[9].firstName).toBe('Scott');
                    expect(result[9].lastName).toBe('Hanselman');
                    expect(result[9].id).toBe(2);
                    expect(result[10].firstName).toBe('Scott');
                    expect(result[10].lastName).toBe('Hanselman');
                    expect(result[10].id).toBe(12);
                    expect(result[11].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                });

            });

            describe("two ThenBy calls, without comparer", function () {

                var orderbyKeySelector = function (p) {
                    return p.firstName.length + p.lastName.length;
                };
                var thenbyKeySelector1 = function (p) {
                    return p.firstName;
                };
                var thenbyKeySelector2 = function (p) {
                    return p.lastName;
                };


                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.OrderBy(orderbyKeySelector)
                                      .ThenBy(thenbyKeySelector1)
                                      .ThenBy(thenbyKeySelector2);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[0].key).toBe(orderbyKeySelector);
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[1].key).toBe(thenbyKeySelector1);
                    expect(result.SortKeys[2].dir).toBe("asc");
                    expect(result.SortKeys[2].key).toBe(thenbyKeySelector2);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                                                      return p.key;
                                                  })
                                                 .ThenBy(function (p) {
                                                     return p.key;
                                                 })
                                                 .ThenBy(function (p) {
                                                     return p.key;
                                                 });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[2].dir).toBe("asc");
                });
                
                it("all input elements have different ThenBy key, changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenBy(function (p) {
                        return p.firstName;
                    })
                    .ThenBy(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Galloway');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Skeet');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[5].firstName).toBe('Rob');
                    expect(result[6].firstName).toBe('Ryan');
                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Guthrie');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Hanselman');
                    expect(result[9].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[2].dir).toBe("asc");
                });

                it("with three different key selectors (OrderBy, ThenBy and ThenBy), changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName.length + p.lastName.length;
                    });

                    result = result.ThenBy(function (p) {
                        return p.firstName;
                    });

                    result = result.ThenBy(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[0].lastName).toBe('Ward');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Skeet');
                    expect(result[2].firstName).toBe('Nifty');
                    expect(result[2].lastName).toBe('Code');
                    expect(result[3].firstName).toBe('Rob');
                    expect(result[3].lastName).toBe('Connery');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result[4].lastName).toBe('Galloway');
                    expect(result[5].firstName).toBe('Ryan');
                    expect(result[5].lastName).toBe('Niemeyer');
                    expect(result[6].firstName).toBe('Scott');
                    expect(result[6].lastName).toBe('Guthrie');
                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Hanselman');
                    expect(result[8].firstName).toBe('Justin');
                    expect(result[8].lastName).toBe('Etheridge');
                    expect(result[9].firstName).toBe('Steven');
                    expect(result[9].lastName).toBe('Sanderson');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[2].dir).toBe("asc");
                });

            });

        });

        describe(".ThenByDescending", function () {

            it("without OrderBy called, throws InvalidOperationException", function () {
                //Act
                expect(function () {
                    var result = viewModel.people.ThenBy();
                }).toThrowError("InvalidOperationException: ThenBy can not be called without OrderBy"); //Assert
            });

            it("without argument, throws ArgumentNullException", function () {
                //Arrange
                var keySelector = function (p) {
                    return p.firstName;
                };
                //Act
                expect(function () {
                    var result = viewModel.people.OrderBy(keySelector)
                                                 .ThenByDescending();
                }).toThrowError("ArgumentNullException: Missing keySelector"); //Assert
            });

            it("keySelector is not a function, throws TypeLoadException", function () {
                //Arrange
                var keySelector = function (p) {
                    return p.firstName;
                };
                expect(function () {
                    var result = viewModel.people.OrderBy(keySelector)
                                                 .ThenByDescending("Not a function");
                }).toThrowError("TypeLoadException: Argument keySelector is not a function");
            });

            describe("one ThenByDescending call, without comparer", function () {

                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    var orderbyKeySelector = function (p) {
                        return p.firstName;
                    };
                    var thenbyKeySelector = function (p) {
                        return p.lastName;
                    };
                    //Act
                    var result = array.OrderBy(orderbyKeySelector)
                                      .ThenByDescending(thenbyKeySelector);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[0].key).toBe(orderbyKeySelector);
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[1].key).toBe(thenbyKeySelector);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.key;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                });

                it("all input elements have different ThenBy key, changes order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.firstName;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Steven');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Ryan');
                    expect(result[3].firstName).toBe('Nifty');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                });

                it("all input elements have different key (OrderBy and ThenBy keys), changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    })
                    .ThenByDescending(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Skeet');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Galloway');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[5].firstName).toBe('Rob');
                    expect(result[6].firstName).toBe('Ryan');
                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Hanselman');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Guthrie');
                    expect(result[9].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                });

                it("some input elements have different key (OrderBy and ThenBy keys), changes order but preserves order of equal elements", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    viewModel.people.push({ id: 11, firstName: 'Nifty', lastName: "Code", friends: [] });
                    viewModel.people.push({ id: 12, firstName: 'Scott', lastName: "Hanselman", friends: [] });

                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    })
                    .ThenByDescending(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(12);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Skeet');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Galloway');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[4].id).toBe(1);
                    expect(result[5].firstName).toBe('Nifty');
                    expect(result[5].id).toBe(11);
                    expect(result[6].firstName).toBe('Rob');
                    expect(result[7].firstName).toBe('Ryan');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Hanselman');
                    expect(result[8].id).toBe(2);
                    expect(result[9].firstName).toBe('Scott');
                    expect(result[9].lastName).toBe('Hanselman');
                    expect(result[9].id).toBe(12);
                    expect(result[10].firstName).toBe('Scott');
                    expect(result[10].lastName).toBe('Guthrie');
                    expect(result[11].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                });

            });

            describe("one ThenByDescending call, with comparer", function () {

                var comparer = function (x, y) {
                    if (x.length < y.length)
                        return 1;
                    if (x.length > y.length)
                        return -1;
                    return 0;
                }

                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    var orderbyKeySelector = function (p) {
                        return p.firstName;
                    };
                    var thenbyKeySelector = function (p) {
                        return p.lastName;
                    };
                    //Act
                    var result = array.OrderBy(orderbyKeySelector)
                                      .ThenByDescending(thenbyKeySelector, comparer);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[0].key).toBe(orderbyKeySelector);
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[1].key).toBe(thenbyKeySelector);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.key;
                    }, function (x, y) {
                        if (x.key < y.key)
                            return -1;
                        if (x.key > y.key)
                            return 1;
                        return 0;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                });

                it("all input elements have different ThenBy key except of two, changes order: the two preserve order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.firstName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Steven');
                    expect(result[1].firstName).toBe('Nifty');
                    expect(result[2].firstName).toBe('Scott');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].comp).toBe(comparer);
                    expect(result.SortKeys[1].dir).toBe("desc");
                });

                it("some input elements have different key (OrderBy and ThenBy keys), changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    })
                    .ThenByDescending(function (p) {
                        return p.lastName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Galloway');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Skeet');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[5].firstName).toBe('Rob');
                    expect(result[6].firstName).toBe('Ryan');
                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Hanselman');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Guthrie');
                    expect(result[9].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[1].comp).toBe(comparer);
                });

                it("some input elements have different key (OrderBy and ThenBy keys), changes order but preserves order of equal elements", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    viewModel.people.push({ id: 11, firstName: 'Nifty', lastName: "Code", friends: [] });
                    viewModel.people.push({ id: 12, firstName: 'Scott', lastName: "Hanselman", friends: [] });

                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName;
                    })
                    .ThenByDescending(function (p) {
                        return p.lastName;
                    }, comparer);
                    //Assert
                    expect(result.length).toBe(12);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Galloway');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Skeet');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[4].id).toBe(1);
                    expect(result[5].firstName).toBe('Nifty');
                    expect(result[5].id).toBe(11);
                    expect(result[6].firstName).toBe('Rob');
                    expect(result[7].firstName).toBe('Ryan');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Hanselman');
                    expect(result[8].id).toBe(2);
                    expect(result[9].firstName).toBe('Scott');
                    expect(result[9].lastName).toBe('Hanselman');
                    expect(result[9].id).toBe(12);
                    expect(result[10].firstName).toBe('Scott');
                    expect(result[10].lastName).toBe('Guthrie');
                    expect(result[11].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                });

            });

            describe("two ThenByDescending calls, without comparer", function () {

                var orderbyKeySelector = function (p) {
                    return p.firstName.length + p.lastName.length;
                };
                var thenbyKeySelector1 = function (p) {
                    return p.firstName;
                };
                var thenbyKeySelector2 = function (p) {
                    return p.lastName;
                };


                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.OrderBy(orderbyKeySelector)
                                      .ThenByDescending(thenbyKeySelector1)
                                      .ThenByDescending(thenbyKeySelector2);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[0].key).toBe(orderbyKeySelector);
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[1].key).toBe(thenbyKeySelector1);
                    expect(result.SortKeys[2].dir).toBe("desc");
                    expect(result.SortKeys[2].key).toBe(thenbyKeySelector2);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.key;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[2].dir).toBe("desc");
                });

                it("all input elements have different ThenBy key, changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.firstName;
                    })
                    .ThenByDescending(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Steven');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[1].lastName).toBe('Hanselman');
                    expect(result[2].firstName).toBe('Scott');
                    expect(result[2].lastName).toBe('Guthrie');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Rob');
                    expect(result[5].firstName).toBe('Nifty');
                    expect(result[6].firstName).toBe('Justin');
                    expect(result[7].firstName).toBe('Jon');
                    expect(result[7].lastName).toBe('Skeet');
                    expect(result[8].firstName).toBe('Jon');
                    expect(result[8].lastName).toBe('Galloway');
                    expect(result[9].firstName).toBe('Dave');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[2].dir).toBe("desc");
                });

                it("with three different key selectors (OrderBy, ThenBy and ThenBy), changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName.length + p.lastName.length;
                    });

                    result = result.ThenByDescending(function (p) {
                        return p.firstName;
                    });

                    result = result.ThenByDescending(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Jon');
                    expect(result[0].lastName).toBe('Skeet');
                    expect(result[1].firstName).toBe('Dave');
                    expect(result[1].lastName).toBe('Ward');

                    expect(result[2].firstName).toBe('Nifty');
                    expect(result[2].lastName).toBe('Code');

                    expect(result[3].firstName).toBe('Rob');
                    expect(result[3].lastName).toBe('Connery');

                    expect(result[4].firstName).toBe('Jon');
                    expect(result[4].lastName).toBe('Galloway');

                    expect(result[5].firstName).toBe('Scott');
                    expect(result[5].lastName).toBe('Guthrie');
                    expect(result[6].firstName).toBe('Ryan');
                    expect(result[6].lastName).toBe('Niemeyer');

                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Hanselman');

                    expect(result[8].firstName).toBe('Steven');
                    expect(result[8].lastName).toBe('Sanderson');
                    expect(result[9].firstName).toBe('Justin');
                    expect(result[9].lastName).toBe('Etheridge');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[2].dir).toBe("desc");
                });

            });

            describe("first one is ThenBy and second one is ThenByDescending call, without comparer", function () {

                var orderbyKeySelector = function (p) {
                    return p.firstName.length + p.lastName.length;
                };
                var thenbyKeySelector1 = function (p) {
                    return p.firstName;
                };
                var thenbyKeySelector2 = function (p) {
                    return p.lastName;
                };


                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.OrderBy(orderbyKeySelector)
                                      .ThenBy(thenbyKeySelector1)
                                      .ThenByDescending(thenbyKeySelector2);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[0].key).toBe(orderbyKeySelector);
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[1].key).toBe(thenbyKeySelector1);
                    expect(result.SortKeys[2].dir).toBe("desc");
                    expect(result.SortKeys[2].key).toBe(thenbyKeySelector2);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenBy(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.key;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[2].dir).toBe("desc");
                });

                it("all input elements have different ThenBy key, changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenBy(function (p) {
                        return p.firstName;
                    })
                    .ThenByDescending(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Skeet');
                    expect(result[2].firstName).toBe('Jon');
                    expect(result[2].lastName).toBe('Galloway');
                    expect(result[3].firstName).toBe('Justin');
                    expect(result[4].firstName).toBe('Nifty');
                    expect(result[5].firstName).toBe('Rob');
                    expect(result[6].firstName).toBe('Ryan');
                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Hanselman');
                    expect(result[8].firstName).toBe('Scott');
                    expect(result[8].lastName).toBe('Guthrie');
                    expect(result[9].firstName).toBe('Steven');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[2].dir).toBe("desc");
                });

                it("with three different key selectors (OrderBy, ThenBy and ThenBy), changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName.length + p.lastName.length;
                    });

                    result = result.ThenBy(function (p) {
                        return p.firstName;
                    });

                    result = result.ThenByDescending(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Dave');
                    expect(result[0].lastName).toBe('Ward');
                    expect(result[1].firstName).toBe('Jon');
                    expect(result[1].lastName).toBe('Skeet');

                    expect(result[2].firstName).toBe('Nifty');
                    expect(result[2].lastName).toBe('Code');

                    expect(result[3].firstName).toBe('Rob');
                    expect(result[3].lastName).toBe('Connery');

                    expect(result[4].firstName).toBe('Jon');
                    expect(result[4].lastName).toBe('Galloway');

                    expect(result[5].firstName).toBe('Ryan');
                    expect(result[5].lastName).toBe('Niemeyer');
                    expect(result[6].firstName).toBe('Scott');
                    expect(result[6].lastName).toBe('Guthrie');

                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Hanselman');

                    expect(result[8].firstName).toBe('Justin');
                    expect(result[8].lastName).toBe('Etheridge');
                    expect(result[9].firstName).toBe('Steven');
                    expect(result[9].lastName).toBe('Sanderson');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("asc");
                    expect(result.SortKeys[2].dir).toBe("desc");
                });

            });

            describe("first one is ThenByDescending and second one is ThenBy call, without comparer", function () {

                var orderbyKeySelector = function (p) {
                    return p.firstName.length + p.lastName.length;
                };
                var thenbyKeySelector1 = function (p) {
                    return p.firstName;
                };
                var thenbyKeySelector2 = function (p) {
                    return p.lastName;
                };


                it("input secuence is empty, returns empty array", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.OrderBy(orderbyKeySelector)
                                      .ThenByDescending(thenbyKeySelector1)
                                      .ThenBy(thenbyKeySelector2);
                    //Assert
                    expect(result.length).toBe(0);
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[0].key).toBe(orderbyKeySelector);
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[1].key).toBe(thenbyKeySelector1);
                    expect(result.SortKeys[2].dir).toBe("asc");
                    expect(result.SortKeys[2].key).toBe(thenbyKeySelector2);
                });

                it("all input elements have same key, preserves order", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.key;
                    })
                    .ThenBy(function (p) {
                        return p.key;
                    });
                    //Assert
                    expect(result.length).toBe(5);
                    expect(result[0].firstName).toBe('Nifty');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[2].firstName).toBe('Steven');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Jon');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[2].dir).toBe("asc");
                });

                it("all input elements have different ThenBy key, changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].key = "Oli";
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.key;
                    })
                    .ThenByDescending(function (p) {
                        return p.firstName;
                    })
                    .ThenBy(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Steven');
                    expect(result[1].firstName).toBe('Scott');
                    expect(result[1].lastName).toBe('Guthrie');
                    expect(result[2].firstName).toBe('Scott');
                    expect(result[2].lastName).toBe('Hanselman');
                    expect(result[3].firstName).toBe('Ryan');
                    expect(result[4].firstName).toBe('Rob');
                    expect(result[5].firstName).toBe('Nifty');
                    expect(result[6].firstName).toBe('Justin');
                    expect(result[7].firstName).toBe('Jon');
                    expect(result[7].lastName).toBe('Galloway');
                    expect(result[8].firstName).toBe('Jon');
                    expect(result[8].lastName).toBe('Skeet');
                    expect(result[9].firstName).toBe('Dave');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[2].dir).toBe("asc");
                });

                it("with three different key selectors (OrderBy, ThenBy and ThenBy), changes order", function () {
                    //Arrange
                    for (var i = 0; i < joinModel.friends().length; i++) {
                        viewModel.people.push(joinModel.friends()[i]);
                    }
                    //Act
                    var result = viewModel.people.OrderBy(function (p) {
                        return p.firstName.length + p.lastName.length;
                    });

                    result = result.ThenByDescending(function (p) {
                        return p.firstName;
                    });

                    result = result.ThenBy(function (p) {
                        return p.lastName;
                    });
                    //Assert
                    expect(result.length).toBe(10);
                    expect(result[0].firstName).toBe('Jon');
                    expect(result[0].lastName).toBe('Skeet');
                    expect(result[1].firstName).toBe('Dave');
                    expect(result[1].lastName).toBe('Ward');

                    expect(result[2].firstName).toBe('Nifty');
                    expect(result[2].lastName).toBe('Code');

                    expect(result[3].firstName).toBe('Rob');
                    expect(result[3].lastName).toBe('Connery');

                    expect(result[4].firstName).toBe('Jon');
                    expect(result[4].lastName).toBe('Galloway');

                    expect(result[5].firstName).toBe('Scott');
                    expect(result[5].lastName).toBe('Guthrie');
                    expect(result[6].firstName).toBe('Ryan');
                    expect(result[6].lastName).toBe('Niemeyer');

                    expect(result[7].firstName).toBe('Scott');
                    expect(result[7].lastName).toBe('Hanselman');

                    expect(result[8].firstName).toBe('Steven');
                    expect(result[8].lastName).toBe('Sanderson');
                    expect(result[9].firstName).toBe('Justin');
                    expect(result[9].lastName).toBe('Etheridge');
                    expect(result.SortKeys[0].dir).toBe("asc");
                    expect(result.SortKeys[1].dir).toBe("desc");
                    expect(result.SortKeys[2].dir).toBe("asc");
                });

            });
        });

        describe(".ToArray", function () {

            it("returns plain javascript array", function () {
                //Act
                var result = viewModel.people.ToArray();

                //Assert
                expect(Array.isArray(result)).toBe(true);
                expect(result[0].firstName).toBe("Nifty");
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("observableArray has no element, returns empty array", function () {
                //Arrange
                var array = ko.observableArray([]);
                //Act
                var result = array.ToArray();
                //Assert
                expect(result.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

        });

        describe(".ToDictionary (Simulating a Dictionary with an Javascript object)", function () {

            //Fake a Dictionary in javascript
            //var a = { "a": "wohoo", 2: "hello2", "d": "hello" };
            //alert(a["a"]);
            //alert(a[2]);
            //alert(a["d"]);

            it("without argument, throws ArgumentNullException", function () {
                expect(function () {
                    var result = viewModel.people.ToDictionary();
                }).toThrowError("ArgumentNullException: Missing keySelector");

            });

            describe("only with keySelector", function () {

                it("and keySelector is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.ToDictionary("Not a function");
                    }).toThrowError("TypeLoadException: Argument keySelector is not a function");
                });

                it("array which is empty, returns empty Dictionary", function () {
                    //Arrange
                    var array = ko.observableArray([]);
                    //Act
                    var result = array.ToDictionary(function (p) { return p.firstName; });
                    //Assert
                    expect(result.Keys.length).toBe(0);
                    expect(result.Count).toBe(0);
                });

                it("array of unique objects, returns Dictionary", function () {
                    //Act
                    var result = viewModel.people.ToDictionary(function (p) { return p.firstName; });
                    //Assert
                    expect(result["Nifty"].lastName).toBe("Code");
                    expect(result.Keys.length).toBe(5);
                    expect(result.Count).toBe(5);
                });

                it("array of non-unique objects, throws ArgumentException", function () {
                    //Arrange
                    viewModel.people()[1].firstName = "Nifty";
                    //Act / Assert
                    expect(function () {
                        var result = viewModel.people.ToDictionary(function (p) { return p.firstName; });
                    }).toThrowError("ArgumentException: An element with the same key already exists");
                });
            });

            describe("with keySelector and elementSelector", function () {

                it("and elementSelector is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.ToDictionary(function (p) { return p.firstName; },
                                                      "Not a function");
                    }).toThrowError("TypeLoadException: Argument elementSelector is not a function");
                });

                it("array of unique objects, returns Dictionary", function () {
                    //Act
                    var result = viewModel.people.ToDictionary(function (p) { return p.firstName; },
                                                               function (p) { return p.lastName; });
                    //Assert
                    expect(result["Nifty"]).toBe("Code");
                    expect(result.Keys.length).toBe(5);
                    expect(result.Count).toBe(5);
                });

            });


            describe("with keySelector, elementSelector and equalityComparer", function () {

                it("and equalityComparer is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        viewModel.people.ToDictionary(function (p) { return p.firstName; },
                                                      function (p) { return p.id; },
                                                      "Not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("array of unique objects, but equalityComparer returns true, throws ArgumentException", function () {
                    //Act / Assert
                    expect(function () {
                        var result = viewModel.people.ToDictionary(
                                            function (p) { return p.firstName; },
                                            function (p) { return p.id; },
                                            function (k1, k2) {
                                                return k1.substr(0, 1) === k2.substr(0, 1);
                                            });
                    }).toThrowError("ArgumentException: An element with the same key already exists");
                });

                it("array of unique objects, and equalityComparer returns false, returns Dictionary", function () {
                    //Act
                    var result = viewModel.people.ToDictionary(function (p) { return p.firstName; },
                                                               function (p) { return p.lastName; },
                                                               function (k1, k2) {
                                                                   return k1.substr(1, 1) === k2.substr(1, 1);
                                                               });
                    //Assert
                    expect(result["Nifty"]).toBe("Code");
                    expect(result.Keys.length).toBe(5);
                    expect(result.Count).toBe(5);
                });

            });

            describe("with keySelector and equalityComparer, but without elementSelector", function () {

                it("array of unique objects, but equalityComparer returns true, throws ArgumentException", function () {
                    //Act / Assert
                    expect(function () {
                        var result = viewModel.people.ToDictionary(
                                            function (p) { return p.firstName; },
                                            null,
                                            function (k1, k2) {
                                                return k1.substr(0, 1) === k2.substr(0, 1);
                                            });
                    }).toThrowError("ArgumentException: An element with the same key already exists");
                });

                it("array of unique objects, and equalityComparer returns false, returns Dictionary", function () {
                    //Act
                    var result = viewModel.people.ToDictionary(function (p) { return p.firstName; },
                                                               null,
                                                               function (k1, k2) {
                                                                   return k1.substr(1, 1) === k2.substr(1, 1);
                                                               });
                    //Assert
                    expect(result["Nifty"].lastName).toBe("Code");
                    expect(result.Keys.length).toBe(5);
                    expect(result.Count).toBe(5);
                });
            });

        });

        describe(".ToObservableArray for computed MISSING", function () {

        });

        describe(".ToLookup", function () {

            it("without argument, throws ArgumentNullException", function () {
                expect(function () {
                    var result = viewModel.people.ToLookup();
                }).toThrowError("ArgumentNullException: Missing keySelector");

            });

            describe("with keySelector", function () {

                it("but keySelector is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.ToLookup("Not a function");
                    }).toThrowError("TypeLoadException: Argument keySelector is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.firstName; });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a group for each element", function () {
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.firstName; });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0][0].firstName).toBe(viewModel.people()[0].firstName);
                });

                it("all elements in the array have the same key, returns a single group for all elements", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.myKey; });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].length).toBe(5);
                    expect(result[0][0].firstName).toBe("Nifty");


                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        if (i < 2) {
                            viewModel.people()[i].myKey = "Stan";
                        }
                        else {
                            viewModel.people()[i].myKey = "Oli";
                        }
                    }
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.myKey; });
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[1].Key).toBe("Oli");
                    expect(result[0].length).toBe(2);
                    expect(result[1].length).toBe(3);
                    expect(result[0][0].firstName).toBe("Nifty");
                    expect(result[0][1].firstName).toBe("Scott");
                    expect(result[1][2].firstName).toBe("Jon");
                });
            });

            describe("with keySelector and elementSelector", function () {

                it("but elementSelector is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.ToLookup(function (p) { return p.firstName; },
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument elementSelector is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a group for each element", function () {
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0][0]).toBe(viewModel.people()[0].lastName);
                });

                it("all elements in the array have the same key, returns a single group for all elements", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.myKey; },
                                                          function (p) { return p.lastName; });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].length).toBe(5);
                    expect(result[0][0]).toBe("Code");
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        if (i < 2) {
                            viewModel.people()[i].myKey = "Stan";
                        }
                        else {
                            viewModel.people()[i].myKey = "Oli";
                        }
                    }
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.myKey; },
                                                          function (p) { return p.lastName; });
                    //Assert
                    expect(result.length).toBe(2);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[1].Key).toBe("Oli");
                    expect(result[0].length).toBe(2);
                    expect(result[1].length).toBe(3);
                    expect(result[0][0]).toBe("Code");
                    expect(result[0][1]).toBe("Hanselman");
                    expect(result[1][2]).toBe("Skeet");
                });

            });

            describe("with keySelector and equalityComparer", function () {

                it("but equalityComparer is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.ToLookup(function (p) { return p.firstName; },
                                                              null,
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.firstName; },
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a row for each element", function () {
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.firstName; },
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0].length).toBe(1);
                });

                it("all elements in the array have the same key, returns a single row", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.myKey; },
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.length < 7 && p2.length < 7;
                                                          });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].length).toBe(5);
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p; },
                                                          null,
                                                          function (p1, p2) {
                                                              return p1.firstName.substr(0, 1) == p2.firstName.substr(0, 1);
                                                          });
                    //Assert
                    expect(result.length).toBe(4);
                    expect(result[0].Key.firstName).toBe("Nifty");
                    expect(result[1].Key.firstName).toBe("Scott");
                    expect(result[2].Key.firstName).toBe("Ryan");
                    expect(result[3].Key.firstName).toBe("Jon");
                    expect(result[0].length).toBe(1);
                    expect(result[1].length).toBe(2);
                    expect(result[2].length).toBe(1);
                    expect(result[3].length).toBe(1);
                });

            });

            describe("with keySelector, elementSelector and equalityComparer", function () {

                it("but equalityComparer is not a function, throws TypeLoadException", function () {
                    expect(function () {
                        var result = viewModel.people.ToLookup(function (p) { return p.firstName; },
                                                              function (p) { return p.lastName; },
                                                              "Not a function");
                    }).toThrowError("TypeLoadException: Argument comparer is not a function");
                });

                it("array is empty, returns empty array", function () {
                    //Arrange
                    viewModel.people.removeAll();
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; },
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(0);
                });

                it("all elements in the array have unique keys, returns a row for each element", function () {
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.firstName; },
                                                          function (p) { return p.lastName; },
                                                          function (p1, p2) {
                                                              return p1.substr(0, 2) == p2.substr(0, 2);
                                                          });
                    //Assert
                    expect(result.length).toBe(viewModel.people().length);
                    expect(result[0].Key).toBe(viewModel.people()[0].firstName);
                    expect(result[0][0]).toBe('Code');
                });

                it("all elements in the array have the same key, returns a single row", function () {
                    //Arrange
                    for (var i = 0; i < viewModel.people().length; i++) {
                        viewModel.people()[i].myKey = "Stan";
                    }
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p.myKey; },
                                                          function (p) { return p.lastName; },
                                                          function (p1, p2) {
                                                              return p1.length < 7 && p2.length < 7;
                                                          });
                    //Assert
                    expect(result.length).toBe(1);
                    expect(result[0].Key).toBe("Stan");
                    expect(result[0].length).toBe(5);
                    expect(result[0][0]).toBe('Code');
                });

                it("some elements in the array have the same key, returns a array of groups", function () {
                    //Act
                    var result = viewModel.people.ToLookup(function (p) { return p; },
                                                          function (p) { return p.lastName; },
                                                          function (p1, p2) {
                                                              return p1.firstName.substr(0, 1) == p2.firstName.substr(0, 1);
                                                          });
                    //Assert
                    expect(result.length).toBe(4);
                    expect(result[0].Key.firstName).toBe("Nifty");
                    expect(result[1].Key.firstName).toBe("Scott");
                    expect(result[2].Key.firstName).toBe("Ryan");
                    expect(result[3].Key.firstName).toBe("Jon");
                    expect(result[0].length).toBe(1);
                    expect(result[1].length).toBe(2);
                    expect(result[2].length).toBe(1);
                    expect(result[3].length).toBe(1);
                    expect(result[1][0]).toBe('Hanselman');
                    expect(result[1][1]).toBe('Sanderson');
                });

            });

        });

        //#endregion

        //#region U

        describe(".Union", function () {

            it("without second argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Union();
                }).toThrowError("ArgumentNullException: Missing second");
            });

            it("second argument is not an array, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.Union({ any: 'something' });
                }).toThrowError("TypeLoadException: Argument second is not an array");
            });

            it("input sequence is empty, return second argument", function () {
                //Arrange
                var array = ko.observableArray([]);
                //Act
                var result = array.Union(viewModel.people);
                //Assert
                expect(result.length).toBe(viewModel.people().length);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                expect(arraysAreDifferent(array, result)).toBe(true);
            });

            it("second argument is an empty array, return input sequence", function () {
                //Arrange
                var array = ko.observableArray([]);
                //Act
                var result = viewModel.people.Union(array);
                //Assert
                expect(result.length).toBe(viewModel.people().length);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                expect(arraysAreDifferent(array, result)).toBe(true);
            });

            it("second argument is identical to input sequence, return input sequence", function () {
                //Act
                var result = viewModel.people.Union(viewModel.people);
                //Assert
                expect(result.length).toBe(viewModel.people().length);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("second argument has same elements as input sequence, return input sequence", function () {
                //Arrange
                var array = ko.observableArray([]);
                for (var i = 0; i < viewModel.people.length; i++) {
                    array.push(viewModel.people()[i]);
                }
                //Act
                var result = viewModel.people.Union(array);
                //Assert
                expect(result.length).toBe(viewModel.people().length);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                expect(arraysAreDifferent(array, result)).toBe(true);
            });

            it("second argument has different elements as input sequence, return input and second sequence", function () {
                //Arrange
                var array = ko.observableArray(viewModel.people()[0].friends);
                //Act
                var result = viewModel.people.Union(array);
                //Assert
                expect(result.length).toBe(8);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                expect(arraysAreDifferent(array, result)).toBe(true);
                expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
            });

            it("second argument has one same element as input sequence, return this element not twice", function () {
                //Arrange
                var array = ko.observableArray(viewModel.people()[0].friends);
                array.push(viewModel.people()[0]);
                //Act
                var result = viewModel.people.Union(array);
                //Assert
                expect(result.length).toBe(8);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
                expect(arraysAreDifferent(array, result)).toBe(true);
                expect(arraysAreDifferent(viewModel.people()[0].friends, result)).toBe(true);
            });

        });

        //#endregion

        //#region W

        describe(".Where", function () {

            it("without predicate, throws an ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Where();
                }).toThrowError("ArgumentNullException: Missing predicate");
            });

            it("empty observableArray, returns empty array", function () {
                var array = ko.observableArray();
                var result = array.Where(function (p) { return p.id > 2; });
                expect(result.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(array().length).toBe(0);
                expect(arraysAreDifferent(array, result)).toBe(true);
            });

            it("has more than one matching entries, returns matching elements", function () {
                //Act
                var result = viewModel.people.Where(function (p) { return p.id < 4 && p.id > 1; });
                //Assert
                expect(result.length).toBe(2);
                expect(result[0].firstName).toBe("Scott");
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("has more than one matching entries and predicate uses index, returns matching elements", function () {
                //Act
                var result = viewModel.people.Where(function (p, i) { return p.id > 1 && i < 3; });
                //Assert
                expect(result.length).toBe(2);
                expect(result[0].firstName).toBe("Scott");
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("observableArray has exact one entry which matches, returns array with one element", function () {
                //Arrange
                var array = ko.observableArray([]);
                array().push(viewModel.people()[0]);
                //Act
                var result = array.Where(function (p) { return p.id < 2; });
                //Assert
                expect(result.length).toBe(1);
                expect(result[0].firstName).toBe("Nifty");
                //Check that original Array(s) have not been mutated
                expect(array().length).toBe(1);
                expect(arraysAreDifferent(array, result)).toBe(true);
            });

            it("observableArray has multiple entries but only one matches, returns array with one element", function () {
                var result = viewModel.people.Where(function (p) { return p.id < 2; });
                expect(result.length).toBe(1);
                expect(result[0].firstName).toBe("Nifty");
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

            it("array has multiple entries but no one matches, returns empty array", function () {
                var result = viewModel.people.Where(function (p) { return p.id > 200; });
                expect(result.length).toBe(0);
                //Check that original Array(s) have not been mutated
                expect(viewModel.people().length).toBe(5);
                expect(arraysAreDifferent(viewModel.people, result)).toBe(true);
            });

        });

        //#endregion

        //#region Z

        describe(".Zip", function () {

            it("without second argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Zip();
                }).toThrowError("ArgumentNullException: Missing second");
            });

            it("without resultSelector argument, throws ArgumentNullException", function () {
                expect(function () {
                    viewModel.people.Zip([]);
                }).toThrowError("ArgumentNullException: Missing resultSelector");
            });

            it("but second argument is not an array, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.Zip("hello", function () {
                        return;
                    });
                }).toThrowError("TypeLoadException: Argument second is not an array");
            });

            it("but resultSelector argument is not a function, throws TypeLoadException", function () {
                expect(function () {
                    viewModel.people.Zip([], "hello");
                }).toThrowError("TypeLoadException: Argument resultSelector is not a function");
            });

            it("with empty input array, returns empty observableArray", function () {
                //Arrange
                var array = ko.observableArray([]);
                array.push(viewModel.people()[0]);
                array.push(viewModel.people()[1]);
                viewModel.people.removeAll();
                //Act
                var result = viewModel.people.Zip(array, function (p1, p2) {
                    return { p1: p1, p2: p2 };
                });
                //Assert
                expect(result.length).toBe(0);
            });

            it("with empty input array, returns empty array", function () {
                //Arrange
                var array = [];
                array.push(viewModel.people()[0]);
                array.push(viewModel.people()[1]);
                viewModel.people.removeAll();
                //Act
                var result = viewModel.people.Zip(array, function (p1, p2) {
                    return { p1: p1, p2: p2 };
                });
                //Assert
                expect(result.length).toBe(0);
            });

            it("with empty second array, returns empty observableArray", function () {
                //Arrange
                var array = ko.observableArray([]);
                //Act
                var result = viewModel.people.Zip(array, function (p1, p2) {
                    return { p1: p1, p2: p2 };
                });
                //Assert
                expect(result.length).toBe(0);
            });

            it("with empty second array, returns empty array", function () {
                //Arrange
                var array = [];
                //Act
                var result = viewModel.people.Zip(array, function (p1, p2) {
                    return { p1: p1, p2: p2 };
                });
                //Assert
                expect(result.length).toBe(0);
            });

            it("with input array longer than second array, returns array with length of second", function () {
                //Arrange
                var inputArray = ko.observableArray(viewModel.people()[0].friends);
                var secondArray = ko.observableArray(viewModel.people()[1].friends);
                //Act
                var result = inputArray.Zip(secondArray, function (p1, p2) {
                    return { p1: p1, p2: p2 };
                });
                //Assert
                expect(result.length).toBe(2);
                expect(result[0].p1.firstName).toBe("Rob");
                expect(result[0].p2.firstName).toBe("Justin");
            });

            it("with input array longer than second array, returns array with length of second", function () {
                //Arrange
                var inputArray = ko.observableArray(viewModel.people()[1].friends);
                var secondArray = ko.observableArray(viewModel.people()[0].friends);
                //Act
                var result = inputArray.Zip(secondArray, function (p1, p2) {
                    return { p1: p1, p2: p2 };
                });
                //Assert
                expect(result.length).toBe(2);
                expect(result[0].p1.firstName).toBe("Justin");
                expect(result[0].p2.firstName).toBe("Rob");
            });

        });

        //#endregion
    });

    describe("Playground", function () {

        //it("Lambda with FuncOf type checking", function () {
        //    //console.log(typeof (5.5));
        //    var int = "int";
        //    var string = "string";
        //    var FuncOf = linq.FuncOf;

        //    //var text = FuncOf("int", "string")("x => x.toString()");
        //    var len = FuncOf("string", "int", "int")("(x,i) => x.length + i");
        //    console.log(len("hello nifty code")); //"hello nifty code"
        //});

        //function z(x) { return x.firstName == "Ryan"; }

        //it("lambda parser", function () {
            
        //    var Func = linq.Func;
        //    var result = ko.utils.arrayFirst(viewModel.people(), Func('x => console.log(x.firstName);' +
        //                                                                'return x.firstName == "Ryan";'));

        //    var result = ko.utils.arrayFirst(viewModel.people(), z);

        //    //return ( Console.log(x.firstName);return x.firstName == "Ryan";);
        //    //console.log(result.firstName);
        //    //alert(func(viewModel.people()[0], 7));
        //});

        //it("lambda parser", function () {
        //    var func = linq.lambda.parse("(x,i) => x.firstName + i");
        //    alert(func(viewModel.people()[0], 7));
        //});
        
    });

    describe("Performace", function () {
        var times = 1000000;
        //it(times + " times with function", function () {

        //    var array = ko.observableArray();
        //    for (var i = 0; i < times; i++) {
        //        array.push(viewModel.people()[i % 5]);
        //    }

        //    var result = array.GroupBy(function (p) {
        //        return p.id;
        //    });

        //    //for (var i = 0; i < result.length; i++) {
        //    //    console.log(result[i]().length);
        //    //}

        //    //for (var i = 0; i < times; i++) {
        //    //    var result = viewModel.people.Where(function (p, i) {
        //    //        return p.id >= 1 && i < 4;
        //    //    });
        //    //}
        //});

        //it(times + " times with lambda", function () {

        //    for (var i = 0; i < times; i++) {
        //        var result = viewModel.people.Where("(p,i) => p.id >= 1 && i < 4");
        //    }

        //});

        //it(times + " times with typed inline lambda", function () {
        //    var FuncOf = linq.FuncOf;
        //    for (var i = 0; i < times; i++) {
        //        var result = viewModel.people.Where(FuncOf("object", "int", "bool")("(p,i) => p.id >= 1 && i < 4"));
        //    }
        //});

        //it(times + " times with typed outline lambda", function () {
        //    var func = linq.FuncOf("object", "int", "bool")("(p,i) => p.id >= 1 && i < 4");
        //    for (var i = 0; i < times; i++) {
        //        var result = viewModel.people.Where(func);
        //    }
        //});

    });

    describe("Memeory Tests", function () {

        //it("same character sequence", function () {
        //    var s1 = "hello world!";
        //    var s2 = "hello world!";

        //    s1 = "hello you!"

        //    expect(s2).toBe("hello world!");
        //});

        ////it("same string reference", function () {
        ////    var s1 = "hello world!";
        ////    var s2 = s1;

        ////    s1 = "hello you!"

        ////    expect(s2).toBe("hello you!");
        ////});

        //it("same anonymuous object", function () {
        //    var o1 = { id: 5, name: "Nifty", lastName: "Code", description: "There is not a lot to say!" };
        //    var o2 = o1;

        //    o1.name = "Code";

        //    expect(o2.name).toBe("Code");
        //});


        //it("build large array of same strings", function () {
        //    var s1 = "hello, this is a wornderfull world! Do you see it the same way?";

        //    window.largeArray = [];
        //    for (var i = 0; i < 1000000; i++) {
        //        window.largeArray.push(s1);
        //    }
        //});

        //it("build large array of same ints", function () {
        //    window.largeIntArray = [];
        //    for (var i = 0; i < 1000000; i++) {
        //        window.largeIntArray.push(i);
        //    }
        //});

        //it("build large array of same objects", function () {
        //    var o1 = { id: 5, name: "Nifty" };

        //    window.largeObjArray = [];
        //    for (var i = 0; i < 1000000; i++) {
        //        window.largeObjArray.push(o1);
        //    }
        //});

    });

});
