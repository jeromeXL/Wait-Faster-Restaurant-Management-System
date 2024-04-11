import socketio


class ActivityPanelNamespace(socketio.AsyncNamespace):
    def on_connect(self, sid, environ):
        print("Connected to activity panel namespace") 

    def on_disconnect(self, sid):
        print("disconnected from activiy panel namespace")

    async def my_event(self, sid, data):
        print("Received a request", data)

