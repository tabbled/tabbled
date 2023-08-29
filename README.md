<div align="center" width="100%">
    <img src="public/favicon.png" width="98" alt="" />
</div>
<h1 align="center">
  Tabbled
</h1>

<div align="center" width="100%">
<img alt="" src="https://img.shields.io/github/last-commit/tabbled/tabbled" /></a>
<a target="_blank" href="https://github.com/louislam/uptime-kuma"><img src="https://img.shields.io/github/stars/tabbled" /></a>
</div>

It's a low-code platform for building web application for enterprise, to manage internal processes of business like ERP, CRM, WMS, etc.


## ⭐ Features

* Drag-and-drop Form Builder to configure user interface
* Built-in data sources and connections to existing databases like PostgreSQL, MySQL, MongoDB, etc.
* Scripting - customize application anywhere with JavaScript
* Functions - cloud functions to evaluating business logic
* Permission - user access limitation for any data or element of interface
* Live data - each device gets synchronized data in real-time

## 🌿 Roadmap

- [x] Sign in and sign on
- [x] Types implementation
- [x] Table editor
- [x] Page designer
- [x] View editor
- [x] DataSource setting page
- [x] Menu setting page
- [x] Table cell editor widgets
- [x] Functions
- [ ] DataSources 
  - [x] Internal DataSource
  - [x] Custom DataSource
  - [x] Field DataSource
  - [x] Aggregation DataSource
  - [ ] REST API
  - [ ] Databases:
    - [ ] PostgresSQL
    - [ ] MongoDB
    - [ ] MySQL
- [x] Dockerized entire project in the one image
- [ ] Desktop version
- [ ] Mobile version
- [ ] PWA implementation

## 🚀 How to Install

**1.Download the docker-compose file example**
```shell
https://raw.githubusercontent.com/tabbled/tabbled/main/docker-compose.yaml
```
**2.Create an .env file with configuration**

Download the example docker-compose file and pass contained variables
```shell
wget https://raw.githubusercontent.com/tabbled/tabbled/main/.env.example
```

**3.Create a docker volume for PostgresSQL data**

```shell
docker volume create pg_data
```

**4.Install and start Tabbled application**
```shell
docker compose up
```

**5.Open `localhost` on a web browser.**

Note: Default login:password are admin:admin

## 	Support

Tabbled is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers.

If you love this project, please consider giving a ⭐.

## License

[MIT](https://github.com/tabbled/tabbled/LICENSE)
