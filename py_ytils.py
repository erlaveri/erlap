import os
import random
import string
import inspect
import uuid


def lineno():
    """Returns the current line number in our program."""
    return inspect.currentframe().f_back.f_lineno


def token_nice(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for x in range(size))


def token_uuid(ver=4):
    return uuid.uuid4().hex if ver == 4 else uuid.uuid1().hex


def token_os(n=32):
    return os.urandom(n)


decorator_with_arguments = lambda decorator: lambda * \
    args, **kwargs: lambda func: decorator(func, *args, **kwargs)