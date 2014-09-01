def lineno():
    """Returns the current line number in our program."""
    import inspect

    return inspect.currentframe().f_back.f_lineno