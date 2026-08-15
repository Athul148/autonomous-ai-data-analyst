from pathlib import Path

import pandas as pd


class DatasetLoader:
    """
    Utility class for loading CSV and Excel datasets.
    """

    @staticmethod
    def _looks_headerless(columns: pd.Index) -> bool:
        column_names = [
            str(column).strip()
            for column in columns
        ]

        has_numeric_header = any(
            name.replace(".", "", 1).isdigit()
            for name in column_names
        )

        has_long_text_header = any(
            len(name) > 40
            for name in column_names
        )

        return (
            has_numeric_header
            and has_long_text_header
        )

    @staticmethod
    def load(
        file_path: str | Path,
    ) -> pd.DataFrame:
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(
                f"Dataset file not found: {file_path}"
            )

        extension = file_path.suffix.lower()

        if extension == ".csv":
            dataframe = pd.read_csv(file_path)

            if DatasetLoader._looks_headerless(
                dataframe.columns
            ):
                dataframe = pd.read_csv(
                    file_path,
                    header=None,
                )

                dataframe.columns = [
                    f"Column_{index + 1}"
                    for index in range(
                        len(dataframe.columns)
                    )
                ]

            return dataframe

        if extension == ".xlsx":
            dataframe = pd.read_excel(file_path)

            if DatasetLoader._looks_headerless(
                dataframe.columns
            ):
                dataframe = pd.read_excel(
                    file_path,
                    header=None,
                )

                dataframe.columns = [
                    f"Column_{index + 1}"
                    for index in range(
                        len(dataframe.columns)
                    )
                ]

            return dataframe

        raise ValueError(
            f"Unsupported dataset format: {extension}"
        )