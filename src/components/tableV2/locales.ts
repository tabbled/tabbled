export default {
    en: {
        group: {
            data: "Data",
            appearance: "Appearance",
            interaction: "Interaction"
        },
        prop: {
            height: "Height",
            datasource: "Data source",
            typeOfDatasource: "Type of data source",
            title: "Title",
            inlineEdit: "Inline editing"
        },
        tooltip: {
            datasourceType: `<p>You can choose what a source of data while show in table</p><p>` +
                `<code>DataSource</code> - setted up datasource</br>` +
                `<code>Script</code> - Js script to get the data</br>`+
                `<code>Data</code> - Data from field of datasource</p>`,
            datasource: "Datasource that added to the page on <b>Data sources</b>"
        }
    },
    ru: {
        group: {
            data: "Данные",
            appearance: "Внешний вид",
            interaction: "Взаимодействие"
        },
        prop: {
            height: "Высота",
            datasource: "Источник данных",
            typeOfDatasource: "Тип источника",
            title: "Заголовок",
            inlineEdit: "Inline редактирование"
        },
        tooltip: {
            datasourceType: `<p>Тип источника данных который будет отображаться в таблице</p><p>` +
                `<code>DataSource</code> - настроенный источник данных</br>` +
                `<code>Script</code> - Js скрипт получения данных, который должен вернуть массив строк с необходимой структурой</br>`+
                `<code>Data</code> - данные из поля источника данных, которые представленны в виде массива</p>`,
            datasource: "<p>Источник данных из которого будет отображаться данные, если источник поддерживает редактирование, " +
                "то можно включить опцию <code>Inline редактирование</code>. </p>" +
                "<p>Отображаются только источники добавленные на страницу в поле <code>Источники данных</code></p>"
        }
    }
}
