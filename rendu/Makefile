# Couleurs pour les messages
RED		:= \033[0;31m
GREEN	:= \033[0;32m
YELLOW	:= \033[0;33m
BLUE	:= \033[0;34m
NC		:= \033[0m # No Color


DOCKER_COMPOSE	= docker compose -f docker-compose.yml

HOST_IP := $(shell hostname -I | tr ' ' '\n' | grep '^10\.' | head -1)
HOST_IP := $(if $(HOST_IP),$(HOST_IP),$(shell hostname -I | cut -d' ' -f1))
HOST_IP := $(if $(HOST_IP),$(HOST_IP),localhost)

# *** Rules ********************************************************************

up:
	@HOST_IP=$(HOST_IP) $(DOCKER_COMPOSE) up -d --build
	@echo "\n$(GREEN)✅ IP hôte détectée: $(HOST_IP)$(NC)"

down:
	@HOST_IP=$(HOST_IP) $(DOCKER_COMPOSE) down

reboot: down up

clean: down
	@echo "$(YELLOW)🧹 Nettoyage...$(NC)"
	docker system prune -af

fclean:
	@echo "$(RED)🔥 Nettoyage complet (volumes et orphelins)...$(NC)"
	docker system prune -af --volumes

rebuild: down clean up

# ******************************************************************************

.PHONY:	up \
		down \
		reboot \
		clean \
		fclean \
		rebuild
