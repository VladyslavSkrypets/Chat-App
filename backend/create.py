from models import *


def main():
    db.create_all()
    db.session.commit()


if __name__ == "__main__":
    main()
