class Stack(Quack):  # for this section, you MUST use Quack ADT
    def top(self):  # implement Stack top operation using Quack operation
        return self.right()  # returns the rightmost element in the Quack

    def push(self, x):  # implement Stack push operation using Quack operation
        # no return value is needed for push
        self.d.append(
            x
        )  # it is pushed to the right end of the Quack therefore QuackPush doesnot work

    def pop(self):  # implement Stack pop operation using Quack operation
        self.QuackPull()  # remove and return the leftmost element in the Quack
