# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: scraeyme <scraeyme@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/06/25 23:10:34 by svogrig           #+#    #+#              #
#    Updated: 2025/07/07 15:57:20 by scraeyme         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

DOCKER_COMPOSE	= docker compose -f docker-compose.yml

up:
	$(DOCKER_COMPOSE) up -d --build

down:
	$(DOCKER_COMPOSE) down

reboot: down up

clean: down
	docker system prune -af

fclean:
	docker system prune -af --volumes --remove-orphans

re: down clean up

.PHONY:	up \
		down \
		clean \
		fclean \
		re
