docker.build.api:
	docker build -t wait-faster-api:latest ./src/backend/
docker.build.web:
	docker build -t wait-faster-web:latest ./src/frontend/

docker.build:
	make docker.build.api
	make docker.build.web


	