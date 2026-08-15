
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings


ALLOWED_EXTENSIONS = {".csv", ".xlsx"}


class FileStorage:
    """
    Utility class for local file storage operations.
    """

    @staticmethod
    def create_user_directory(user_id: int) -> Path:
        """
        Create the user's upload directory if it does not exist.
        """
        user_directory = Path(settings.UPLOAD_DIR) / f"user_{user_id}"
        user_directory.mkdir(parents=True, exist_ok=True)

        return user_directory

    @staticmethod
    def generate_filename(original_filename: str) -> str:
        """
        Generate a unique filename while preserving the file extension.
        """
        extension = Path(original_filename).suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise ValueError(
                "Unsupported file type. Only CSV and XLSX files are allowed."
            )

        return f"{uuid4()}{extension}"

    @staticmethod
    def save_file(
        upload_file: UploadFile,
        user_id: int,
    ) -> tuple[str, str]:
        """
        Save an uploaded file to the user's storage directory.

        Returns:
            A tuple containing the storage path and generated filename.
        """
        if not upload_file.filename:
            raise ValueError("Uploaded file must have a filename.")

        user_directory = FileStorage.create_user_directory(user_id)

        generated_filename = FileStorage.generate_filename(
            upload_file.filename
        )

        file_path = user_directory / generated_filename

        try:
            upload_file.file.seek(0)

            with file_path.open("wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)

        except Exception:
            if file_path.exists():
                file_path.unlink()

            raise

        return str(file_path), generated_filename

    @staticmethod
    def delete_file(path: str) -> None:
        """
        Delete a stored file if it exists.
        """
        file_path = Path(path)

        if file_path.is_file():
            file_path.unlink()
