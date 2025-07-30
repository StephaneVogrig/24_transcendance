# Color codes for terminal output
RED		:=\033[0;31m
GREEN   :=\033[0;32m
YELLOW	:=\033[0;33m
BLUE	:=\033[0;34m
DEFAULT	:=\033[0m

DOCKER_COMPOSE	= docker compose -f docker-compose.yml

# Host IP detection
HOST_IP	:=	$(shell hostname -I | tr ' ' '\n' | grep '^10\.' | head -1)
HOST_IP	:=	$(if $(HOST_IP),$(HOST_IP),$(shell hostname -I | cut -d' ' -f1))
HOST_IP	:=	$(if $(HOST_IP),$(HOST_IP),localhost)
export HOST_IP

# Directory for SSL certificates
SSL_DIR	:=	ssl

SERVICES_PORTS	:=	ai:3009 \
					authentification:3001 \
					blockchain:3002 \
					database:3003 \
					game:3004 \
					gateway:3000 \
					matchmaking:3005 \
					tournament:3007 \
					scores:3006 \
					websocket:3008 \
					frontend:5173

# Extract service names from SERVICES_PORTS
SERVICES := $(foreach element,$(SERVICES_PORTS),$(word 1,$(subst :, ,$(element))))

# export an environnement varaible for the port of each service
$(foreach element,$(SERVICES_PORTS),$(eval export $(shell echo $(word 1,$(subst :, ,$(element))) | tr 'a-z' 'A-Z')_PORT := $(word 2,$(subst :, ,$(element)))))

# *** Rules ********************************************************************

all: ssl up

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

build:
	@$(DOCKER_COMPOSE) build

rebuild: clean up

up:
	@$(DOCKER_COMPOSE) up -d --build
	@echo "$(GREEN)✅ IP hôte détectée: $(HOST_IP)$(DEFAULT)"

down:
	@$(DOCKER_COMPOSE) down

restart: down up

logs:
	@$(DOCKER_COMPOSE) logs

clean:
	@echo "$(YELLOW)🧹 Nettoyage...$(DEFAULT)"
	@$(DOCKER_COMPOSE) down --rmi local

fclean:
	@echo "$(YELLOW)🔥 Nettoyage complet (volumes et orphelins)...$(DEFAULT)"
	-@$(DOCKER_COMPOSE) down --volumes --rmi local || true
	-@docker system prune -af --volumes || true
	@rm -rf $(SSL_DIR)

# Check the health of the services
health:
	@test -f ./healthChecker.sh || { echo "$(RED)healthChecker.sh manquant$(DEFAULT)"; exit 1; }
	@./healthChecker.sh "$(HOST_IP)" "$(SERVICES_PORTS)"

ps:
	@echo "$(BLUE)Host IP : $(DEFAULT)$(HOST_IP)$(DEFAULT)"
	@$(DOCKER_COMPOSE) ps

# *** rules for each services *************************************************************

define SERVICE_RULES
up$(1):
	@$$(DOCKER_COMPOSE) up -d --build $(1)

down$(1):
	@$$(DOCKER_COMPOSE) down $(1)

restart$(1): down$(1) up$(1)

logs$(1):
	@$$(DOCKER_COMPOSE) logs $(1)
endef

$(foreach service,$(SERVICES),$(eval $(call SERVICE_RULES,$(service))))

# ******************************************************************************

.PHONY:	all \
		ssl \
		build \
		up \
		down \
		restart \
		clean \
		fclean \
		rebuild \
		health \
		ps \
		$(foreach s,$(SERVICES),up$(s) down$(s) reboot$(s) logs$(s))
