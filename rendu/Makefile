# ***************************************************************************# Monitoring
ps: ## Affiche le statut des containers
	docker compose ps

top: ## Affiche l'utilisation des ressources
	docker stats

reboot: down up

fclean:
	docker system prune -af --volumes
	rm -rf $(DATA_DIR_MARIADB)
	rm -rf $(DATA_DIR_WORDPRESS)

re: down clean up                                                                 #


.PHONY: help build dev prod clean logs stop restart

# Variables
COMPOSE_FILE_DEV = docker-compose.yml
COMPOSE_FILE_PROD = docker-compose.prod.yml
PROJECT_NAME = transcendence

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# Mode développement
dev: ## Lance l'application en mode développement
	docker-compose -f $(COMPOSE_FILE_DEV) up --build

dev-detached: ## Lance l'application en mode développement (arrière-plan)
	docker-compose -f $(COMPOSE_FILE_DEV) up --build -d

# Mode production
prod: ## Lance l'application en mode production
	docker-compose -f $(COMPOSE_FILE_PROD) up --build -d

prod-build: ## Build les images en mode production
	docker-compose -f $(COMPOSE_FILE_PROD) build --no-cache

# Commandes générales
build: ## Build toutes les images
	docker-compose -f $(COMPOSE_FILE_DEV) build

# Ancienne commande up (garde pour compatibilité)
up: ## Lance l'application (alias pour dev-detached)
	docker-compose -f $(COMPOSE_FILE_DEV) up -d --build

stop: ## Arrête tous les containers
	docker-compose -f $(COMPOSE_FILE_DEV) down
	docker-compose -f $(COMPOSE_FILE_PROD) down

down: ## Arrête les containers (alias pour stop)
	$(MAKE) stop

clean: ## Nettoie les containers, images et volumes
	docker compose -f $(COMPOSE_FILE_DEV) down --volumes --remove-orphans
	docker compose -f $(COMPOSE_FILE_PROD) down --volumes --remove-orphans
	docker system prune -f

logs: ## Affiche les logs
	docker compose -f $(COMPOSE_FILE_DEV) logs -f

logs-prod: ## Affiche les logs en production
	docker compose -f $(COMPOSE_FILE_PROD) logs -f

restart: ## Redémarre les services
	$(MAKE) stop
	$(MAKE) dev

restart-prod: ## Redémarre les services en production
	docker compose -f $(COMPOSE_FILE_PROD) down
	$(MAKE) prod

# Commandes spécifiques aux services
frontend-logs: ## Logs du frontend uniquement
	docker compose logs -f frontend

backend-logs: ## Logs du backend uniquement
	docker compose logs -f gateway

# Monitoring
ps: ## Affiche le statut des containers
	docker-compose ps

top: ## Affiche l'utilisation des ressources
	docker stats

reboot: down up

clean: down
	docker system prune -af

fclean:
	docker system prune -af --volumes
	rm -rf $(DATA_DIR_MARIADB)
	rm -rf $(DATA_DIR_WORDPRESS)

re: down clean up

.PHONY:	up \
		down \
		clean \
		fclean \
		re
