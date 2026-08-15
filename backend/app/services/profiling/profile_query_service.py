from app.exceptions.auth import UserNotFoundException
from app.repositories.dataset_profile_repository import (
    DatasetProfileRepository,
)
from app.schemas.dataset_profile_schema import (
    DatasetProfileResponse,
)


class ProfileQueryService:
    """
    Service for retrieving dataset profiles.
    """

    def __init__(
        self,
        repository: DatasetProfileRepository,
    ):
        self.repository = repository

    def get_profile(
        self,
        dataset_id: int,
    ) -> DatasetProfileResponse:

        profile = self.repository.get_by_dataset_id(
            dataset_id
        )

        if profile is None:
            raise UserNotFoundException(
                "Dataset profile not found."
            )

        return DatasetProfileResponse.model_validate(
            profile
        )