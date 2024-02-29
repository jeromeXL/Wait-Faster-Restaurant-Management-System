backend:

updb:
	# Create a docker container called 'WaitFaster-MongoDb', exposed on port 27017
	docker run --name WaitFaster-MongoDb mongo:latest -p 27017:27017

downdb:
	# Drop a docker container called 'WaitFaster-MongoDb'
	docker stop WaitFaster-MongoDb
	docker rm WaitFaster-MongoDb