MAKEFLAGS += --no-print-directory

# Color codes for terminal output
RED		:=\033[0;31m
GREEN   :=\033[0;32m
YELLOW	:=\033[0;33m
BLUE	:=\033[0;34m
PURPPLE	:=\033[0;35m
DEFAULT	:=\033[0m

PROJECT_NAME_PROD = transcendence
PROJECT_NAME_DEV = $(PROJECT_NAME_PROD)-dev

DOCKER_COMPOSE_PROD = docker-compose-prod.yml
DOCKER_COMPOSE_DEV = docker-compose-dev.yml

COMPOSE_FILES_PROD = -f $(DOCKER_COMPOSE_PROD)
COMPOSE_FILES_DEV = -f $(DOCKER_COMPOSE_PROD) -f $(DOCKER_COMPOSE_DEV)

DOCKER_COMPOSE_PROD_CMD = COMPOSE_PROJECT_NAME=$(PROJECT_NAME_PROD) NODE_ENV=production docker compose $(COMPOSE_FILES_PROD)
DOCKER_COMPOSE_DEV_CMD = COMPOSE_PROJECT_NAME=$(PROJECT_NAME_DEV) NODE_ENV=development docker compose $(COMPOSE_FILES_DEV)

# Host IP detection
HOST_IP	:=	$(shell hostname -I | tr ' ' '\n' | grep '^10\.' | head -1)
HOST_IP	:=	$(if $(HOST_IP),$(HOST_IP),$(shell hostname -I | cut -d' ' -f1))
HOST_IP	:=	$(if $(HOST_IP),$(HOST_IP),localhost)
export HOST_IP

# Directory for SSL certificates
SSL_DIR	:=	ssl

# Directory for database SQLITE
DB_DIR	:= backend/database/db_data

SERVICES_PORTS	:=	ai:3009 \
					authentification:3001 \
					blockchain:3002 \
					database:3003 \
					game:3004 \
					gateway:3010 \
					matchmaking:3005 \
					tournament:3007 \
					scores:3006 \
					websocket:3008 \
					frontend:5173 \
					proxy:3000

# Extract service names from SERVICES_PORTS
SERVICES := $(foreach element,$(SERVICES_PORTS),$(word 1,$(subst :, ,$(element))))

# export an environnement varaible for the port of each service
$(foreach element,$(SERVICES_PORTS),$(eval export $(shell echo $(word 1,$(subst :, ,$(element))) | tr 'a-z' 'A-Z')_PORT := $(word 2,$(subst :, ,$(element)))))

# Function to check if a specific Docker Compose project is running
IS_RUNNING = $(shell docker compose -p $(1) ps -q | grep -q . && echo 1 || echo 0)

# Set ACTIVE_ENV to 'prod', 'dev', or 'none'
ifeq ($(call IS_RUNNING,$(PROJECT_NAME_PROD)),1)
    ACTIVE_ENV := prod
else ifeq ($(call IS_RUNNING,$(PROJECT_NAME_DEV)),1)
    ACTIVE_ENV := dev
else
    ACTIVE_ENV := none
endif
export ACTIVE_ENV

# *** Rules ********************************************************************

all: up

prod: up

dev: up-dev

# SSL certificates generation
ssl: $(SSL_DIR)/key.pem $(SSL_DIR)/cert.pem
	@echo "$(BLUE)Certificats SSL/TLS déjà présents dans $(SSL_DIR)/. Skipping generation.$(DEFAULT)"

$(SSL_DIR)/key.pem $(SSL_DIR)/cert.pem:
	@echo "$(GREEN)Génération des certificats SSL/TLS...$(DEFAULT)"
	@mkdir -p $(SSL_DIR)
	@openssl req \
		-x509 \
		-nodes \
		-newkey rsa:4096 \
		-keyout $(SSL_DIR)/key.pem \
		-out $(SSL_DIR)/cert.pem \
		-days 365 \
		-subj "/C=FR/ST=NA/L=Angouleme/O=Transcendence/CN=$(HOST_IP)"
	@echo "$(GREEN)Certificats générés dans $(SSL_DIR)/$(DEFAULT)"

setup:
	@mkdir -p $(DB_DIR)
	@echo "$(GREEN)Folder 'db_data' ready for SQLite.$(DEFAULT)"

build:
	$(DOCKER_COMPOSE_PROD_CMD) build;

build-prod: build

build-dev:
	$(DOCKER_COMPOSE_DEV_CMD) build;

up: setup ssl
	@if [ "$(ACTIVE_ENV)" = "dev" ]; then \
		$(DOCKER_COMPOSE_DEV_CMD) down; \
	fi; \
	$(DOCKER_COMPOSE_PROD_CMD) up -d --build; \
	echo "$(BLUE)IP hôte: $(HOST_IP)$(DEFAULT)"; \
	echo "$(PURPPLE)Transcendence started in mode 🚀 production$(DEFAULT)";

up-prod: up

up-dev: setup ssl
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		$(DOCKER_COMPOSE_PROD_CMD) down; \
	fi; \
	$(DOCKER_COMPOSE_DEV_CMD) up -d --build; \
	echo "$(BLUE)IP hôte: $(HOST_IP)$(DEFAULT)"; \
	echo "$(PURPPLE)Transcendence started in mode ⚒️  development$(DEFAULT)";

start: up

start-prod: up

start-dev: up-dev

down:
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		$(DOCKER_COMPOSE_PROD_CMD) down; \
    elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
		$(DOCKER_COMPOSE_DEV_CMD) down; \
	else \
        echo "$(YELLOW)No Transcendence stack is currently active. Nothing to stop.$(DEFAULT)"; \
    fi

stop: down

restart:
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		$(DOCKER_COMPOSE_PROD_CMD) down; \
		$(MAKE) up; \
    elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
		$(DOCKER_COMPOSE_DEV_CMD) down; \
		$(MAKE) up-dev; \
	else \
        echo "$(YELLOW)No Transcendence stack is currently active. Nothing to restart.$(DEFAULT)"; \
    fi

restart-services:
	@services_to_restart=$$(echo $(SERVICES) | tr ' ' '\n' | grep -v 'gateway' | grep -v 'proxy' | grep -v 'frontend' | tr '\n' ' '); \
	if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		$(DOCKER_COMPOSE_PROD_CMD) down $$services_to_restart; \
		$(DOCKER_COMPOSE_PROD_CMD) up -d --build $$services_to_restart; \
	elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
		$(DOCKER_COMPOSE_DEV_CMD) down $$services_to_restart; \
		$(DOCKER_COMPOSE_DEV_CMD) up -d --build $$services_to_restart; \
	else \
		echo "$(YELLOW)No Transcendence stack is currently active. Nothing to restart.$(DEFAULT)"; \
	fi

logs:
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
        $(DOCKER_COMPOSE_PROD_CMD) logs; \
    elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
        $(DOCKER_COMPOSE_DEV_CMD) logs; \
    else \
        echo "$(YELLOW)No Transcendence stack is currently active to display logs for.$(DEFAULT)"; \
    fi

clean:
	@echo "$(YELLOW)🧹 Nettoyage...$(DEFAULT)"
	-@$(DOCKER_COMPOSE_PROD_CMD) down --rmi local || true
	-@$(DOCKER_COMPOSE_DEV_CMD) down --rmi local || true

fclean:
	@$(MAKE) clean
	@echo "$(YELLOW)🔥 Nettoyage complet (volumes et orphelins)...$(DEFAULT)"
	-@docker system prune -af --volumes || true
	@rm -rf $(SSL_DIR)
	@rm -rf $(DB_DIR)

# Check the health of the services
health:
	@test -f ./healthChecker.sh || { echo "$(RED)healthChecker.sh manquant$(DEFAULT)"; exit 1; }
	@./healthChecker.sh "$(HOST_IP)" "$(SERVICES_PORTS)"

# display the current docker running
ps:
	@echo "$(BLUE)Host IP : $(DEFAULT)$(HOST_IP)$(DEFAULT)"
	@docker ps

# display the current mode: prod or dev
mode:
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		echo "$(PURPPLE)Transcendence is in mode 🚀 production$(DEFAULT)"; \
    elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
		echo "$(PURPPLE)Transcendence is in mode ⚒️  development$(DEFAULT)"; \
    else \
		echo "$(YELLOW)Transcendence is not started$(DEFAULT)"; \
    fi

# display the host ip
ip:
	@echo "$(PURPPLE)IP hôte: $(HOST_IP)$(DEFAULT)"

# *** rules for each services *************************************************************

define SERVICE_RULES
up-$(1):
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		$$(DOCKER_COMPOSE_PROD_CMD) up $(1) -d --build; \
    elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
		$$(DOCKER_COMPOSE_DEV_CMD) up $(1) -d --build; \
	else \
        echo "$$(YELLOW)No Transcendence stack is currently active. Nothing to up.$$(DEFAULT)"; \
    fi

down-$(1):
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		$$(DOCKER_COMPOSE_PROD_CMD) down $(1); \
    elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
		$$(DOCKER_COMPOSE_DEV_CMD) down $(1); \
	else \
        echo "$$(YELLOW)No Transcendence stack is currently active. Nothing to down.$$(DEFAULT)"; \
    fi

restart-$(1):
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		$$(DOCKER_COMPOSE_PROD_CMD) down $(1); \
		$$(DOCKER_COMPOSE_PROD_CMD) up $(1) -d --build; \
    elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
		$$(DOCKER_COMPOSE_DEV_CMD) down $(1); \
		$$(DOCKER_COMPOSE_DEV_CMD) up $(1) -d --build; \
	else \
        echo "$(YELLOW)No Transcendence stack is currently active. Nothing to restart.$(DEFAULT)"; \
    fi

logs-$(1):
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		$$(DOCKER_COMPOSE_PROD_CMD) logs $(1); \
    elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
		$$(DOCKER_COMPOSE_DEV_CMD) logs $(1); \
	else \
        echo "$(YELLOW)No Transcendence stack is currently active. No docker to logs.$(DEFAULT)"; \
    fi

exec-$(1):
	@if [ "$(ACTIVE_ENV)" = "prod" ]; then \
		$$(DOCKER_COMPOSE_PROD_CMD) exec $(1) sh; \
    elif [ "$(ACTIVE_ENV)" = "dev" ]; then \
		$$(DOCKER_COMPOSE_DEV_CMD) exec $(1) sh; \
	else \
        echo "$(YELLOW)No Transcendence stack is currently active. No docker to exec.$(DEFAULT)"; \
    fi

endef

$(foreach service,$(SERVICES),$(eval $(call SERVICE_RULES,$(service))))

# ******************************************************************************

.PHONY:	all \
		prod \
		dev \
		ssl \
		setup \
		build \
		build-prod \
		build-dev \
		up \
		up-prod \
		up-dev \
		down \
		start \
		start-prod \
		start-dev \
		stop \
		restart \
		restart-services \
		logs \
		clean \
		fclean \
		health \
		ps \
		mode \
		ip \
		$(foreach s,$(SERVICES),up-$(s) down-$(s) restart-$(s) logs-$(s) exec-$(s))
