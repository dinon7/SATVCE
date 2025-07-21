import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from alembic.config import Config
from alembic import command

def main() -> None:
    print("Running database migrations")
    try:
        # Create Alembic configuration
        alembic_cfg = Config(os.path.join(backend_dir, "alembic.ini"))
        
        # Run the migration
        command.upgrade(alembic_cfg, "head")
        print("Migrations completed successfully")
    except Exception as e:
        print(f"Error running migrations: {e}")
        raise e

if __name__ == "__main__":
    main() 