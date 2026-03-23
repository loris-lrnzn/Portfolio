FROM alpine:3.19

ARG PB_VERSION=0.22.21

RUN apk add --no-cache unzip ca-certificates wget

RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    -O /tmp/pocketbase.zip && \
    unzip /tmp/pocketbase.zip -d /pb && \
    rm /tmp/pocketbase.zip

EXPOSE 8090

VOLUME /pb/pb_data

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
