class Queue(Quack):  # for this section, you MUST use Quack ADT
    def front(self):  # implement Queue front operation using Quack operation
        self.left()  # returns the leftmost element in the Quack

    def enqueue(self, x):  # implement Queue enqueue operation using Quack operation
        # no return value is needed for enqueue
        self.QuackPush(x)  # push to left end of the Quack

    def dequeue(self):  # implement Queue dequeue operation using Quack operation
        self.QuackPull()  # pop from right so it is first in first out
