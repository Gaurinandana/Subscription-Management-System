from flask import Flask

def create_app():

    app = Flask(__name__)

    @app.route("/")
    def home():
        return {
            "message": "Welcome to Brightloop Subscription Management System",
            "status": "Backend is running successfully"
        }

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)