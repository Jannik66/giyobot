![GiyoBot](https://imgur.com/MN8EhcW.png)

GiyoBot is a simple discord bot for testing the Github CI & automated docker deploy

# Docker Container
GiyoBot gets automatically deployed on [Docker Hub](https://hub.docker.com/r/giyomoon/giyobot) and can be pulled from there.

## Running the container
The container can be run with the following commands:
```
docker pull giyomoon/giyobot:latest
docker run -d -e GIYOBOT_TOKEN=YOUR_BOT_TOKEN -e GIYOBOT_OWNERID=YOUR_DISCORD_USER_ID --name giyobot giyomoon/giyobot -v YOUR_DATA_FOLDER:/giyobot/sqlite/
```