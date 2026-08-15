from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.exceptions.auth import (
    EmailAlreadyExistsException,
    InactiveUserException,
    InvalidCredentialsException,
)
from app.repositories.user_repository import UserRepository
from app.schemas.auth_schema import (
    LoginResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)


class AuthService:
    """
    Business logic for authentication.
    """

    def __init__(self, repository: UserRepository):
        self.repository = repository

    def register(self, user_data: UserRegister) -> UserResponse:
        """
        Register a new user.
        """
        normalized_email = str(user_data.email).lower()

        existing_user = self.repository.get_by_email(normalized_email)

        if existing_user:
            raise EmailAlreadyExistsException(
                "Email already registered."
            )

        password_hash = hash_password(user_data.password)

        user = self.repository.create(
            name=user_data.name.strip(),
            email=normalized_email,
            password_hash=password_hash,
        )

        return UserResponse.model_validate(user)

    def login(self, credentials: UserLogin) -> LoginResponse:
    # """
    # Authenticate a user and return JWT token with user details.
    # """

      normalized_email = str(credentials.email).lower()

      user = self.repository.get_by_email(normalized_email)

      if not user:
        raise InvalidCredentialsException(
            "Invalid email or password."
        )

      if not verify_password(
        credentials.password,
        user.password_hash,
      ):
        raise InvalidCredentialsException(
            "Invalid email or password."
        )

      if not user.is_active:
        raise InactiveUserException(
            "User account is inactive."
        )

      access_token = create_access_token(
        subject=str(user.id)
      )

      return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
      )

    def login_with_form(
      self,
      email: str,
      password: str,
    ) -> LoginResponse:
    # """
    # Authenticate using OAuth2 form credentials.
    # """
      normalized_email = email.strip().lower()

      user = self.repository.get_by_email(normalized_email)

      if not user:
        raise InvalidCredentialsException(
            "Invalid email or password."
        )

      if not verify_password(password, user.password_hash):
        raise InvalidCredentialsException(
            "Invalid email or password."
        )

      if not user.is_active:
        raise InactiveUserException(
            "User account is inactive."
        )

      access_token = create_access_token(
        subject=str(user.id)
      )

      return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
      )
