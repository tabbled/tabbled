<div align="center" width="100%">
    <img src="./public/icon.png" width="98" alt="" />
</div>
<h1 align="center">
  Tabbled
</h1>

<div align="center" width="100%">
<img src="https://img.shields.io/github/last-commit/tabbled/tabbled" /></a>
<a target="_blank" href="https://github.com/louislam/uptime-kuma"><img src="https://img.shields.io/github/stars/tabbled" /></a>
</div>

It's a low-code platform for building web application for enterprise, to manage internal processes of business.


## ⭐ Features

* Drag-and-drop user interface configuration
* Built-in data sources or connections to existing databases like PostgreSQL, MySQL, MongoDB, etc.
* Scripting - JavaScript works anywhere
* Functions - cloud functions, evaluating on the server side 
* Permission - you can limit access to any data for users and groups
* Live data - each device gets synchronized data in real-time
* Offline working - the data you chose as offline will be available offline wherever you go

## 🌿 Roadmap

- [x] Sign in and sign on
- [x] Types implementation
- [x] Table editor
- [x] Page designer
- [x] Offline data first
- [x] Progressive Web App
- [x] View editor
- [x] Store user data and config in IndexedDB
- [ ] js models for tables
- [ ] DataSource setting page
- [ ] Menu setting page
- [ ] Table cell editor widgets
- [ ] Functions
- [ ] DataSources 
  - [x] Internal DataSources
  - [ ] REST API
  - [ ] Databases:
    - [ ] PostgresSQL
    - [ ] MongoDB
    - [ ] MySQL  
- [ ] Dockerize entire project in the one image
- [x] PWA application
- [ ] Desktop version
- [ ] Mobile version

## 🚀 How to Install

### 🐳 Docker

**1.Download the example docker-compose file**
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

### 💪🏻 Non-Docker

Required:
- Node.js >= 14
- Git
- [Tubbled server](https://github.com/tabbled/tabbled-server)

```bash
$ git clone https://github.com/tabbled/tabbled
$ cd tabbled
$ npm install
$ npm start preview
```

## 	Support

Tabbled is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers.

If you love this project, please consider giving a ⭐.

## License

[MIT](https://github.com/tabbled/tabbled/LICENSE)
