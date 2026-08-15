class AuthException(Exception):
    """
    Base authentication exception.
    """
    pass


class EmailAlreadyExistsException(AuthException):
    """
    Raised when a user tries to register with an existing email.
    """
    pass


class InvalidCredentialsException(AuthException):
    """
    Raised when login credentials are invalid.
    """
    pass


class UserNotFoundException(AuthException):
    """
    Raised when the requested user cannot be found.
    """
    pass


class InactiveUserException(AuthException):
    """
    Raised when an inactive user attempts to log in.
    """
    pass