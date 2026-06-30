FROM nginx:alpine
COPY prototype-stack.html /usr/share/nginx/html/index.html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
