FROM nginx:1.27.3

WORKDIR /usr/share/nginx/html

ARG ADIF_URL
ENV ADIF_URL=${ADIF_URL}
ARG TITLE
ENV TITLE=${TITLE}
ARG BRAND
ENV BRAND=${BRAND}

COPY . /usr/share/nginx/html

RUN bash build.sh
