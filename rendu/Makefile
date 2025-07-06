# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: scraeyme <scraeyme@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/06/25 23:10:34 by svogrig           #+#    #+#              #
#    Updated: 2025/06/27 10:54:27 by scraeyme         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

DOCKER_COMPOSE_DEV	= docker compose -f docker-compose.yml
DOCKER_COMPOSE_PROD	= docker compose -f docker-compose.prod.yml

# Development targets
up:
	$(DOCKER_COMPOSE_DEV) up -d --build

down:
	$(DOCKER_COMPOSE_DEV) down

# Production targets
production:
	$(DOCKER_COMPOSE_PROD) up -d --build

production-down:
	$(DOCKER_COMPOSE_PROD) down

production-logs:
	$(DOCKER_COMPOSE_PROD) logs -f

production-restart: production-down production

# Common targets
reboot: down up

# Utility targets
generate-locks:
	./generate-lock-files.sh

fix-typescript:
	./update-tsconfig.sh

setup-frontend-prod:
	./setup-frontend-prod.sh

validate-json:
	./validate-json.sh

clean: down production-down
	docker system prune -af

fclean:
	docker system prune -af --volumes
	rm -rf $(DATA_DIR_MARIADB)
	rm -rf $(DATA_DIR_WORDPRESS)

re: down clean up

.PHONY:	up \
		down \
		production \
		production-down \
		production-logs \
		production-restart \
		generate-locks \
		fix-typescript \
		setup-frontend-prod \
		validate-json \
		clean \
		fclean \
		re \
		reboot
