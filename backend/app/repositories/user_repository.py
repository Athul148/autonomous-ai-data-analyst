from typing import Optional

from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """
    Repository for user-related database operations.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Return a user by email.
        """
        return (
            self.db.query(User)
            .filter(User.email == email)
            .first()
        )

    def get_by_id(self, user_id: int) -> Optional[User]:
        """
        Return a user by ID.
        """
        return (
            self.db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    def create(
        self,
        *,
        name: str,
        email: str,
        password_hash: str,
    ) -> User:
        """
        Create and persist a new user.
        """
        user = User(
            name=name,
            email=email,
            password_hash=password_hash,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user