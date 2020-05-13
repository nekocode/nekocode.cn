FROM nginx:alpine

COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY main.sh /main.sh

EXPOSE 80

ENTRYPOINT ["/main.sh"]
