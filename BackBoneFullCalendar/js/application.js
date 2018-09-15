$(function () {
    var Event = Backbone.Model.extend();
    
    var Events = Backbone.Collection.extend({
        model: Event,
        url: 'events'
    });

    var EventsView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, _.functions(this));
            this.collection.bind('reset', this.addAll);
            this.collection.bind('add', this.addOne);
            this.collection.bind('change', this.change);            
            this.collection.bind('destroy', this.destroy);

            this.eventView = new EventView();
        },
        render: function () {
            
            return this.$el.fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay',
                    ignoreTimezone: false
                },
                selectable: true,
                selectHelper: true,
                editable: true,
                ignoreTimezone: false,
                select: this.select,
                eventClick: this.eventClick,
                eventDrop: this.eventDropOrResize,
                eventResize: this.eventDropOrResize
            });

        },
        addAll: function () {
            this.el.fullCalendar('addEventSource', this.collection.toJSON());
        },
        addOne: function (event) {
            this.el.fullCalendar('renderEvent', event.toJSON);
        },
        select: function (startDate, endDate) {
            this.eventView.collection = this.collection;
            this.eventView.model = new Event({ start: startDate, end: endDate });
            new EventView().render();
        },
        eventClick: function (fcEvent) {
            this.eventView.model = this.collection.get(fcEvent.id);
            this.eventView.render();
        },
        change: function (event) {
            var fcEvent = this.el.fullCalendar('clientEvents', event.get('id'))[0];
            fcEvent.title = event.get('title');
            fcEvent.color = event.get('color');

            this.el.fullCalendar('updateEvent', fcEvent);
        },
        eventDropOrResize: function (fcEvent) {
            this.collection.get(fcEvent.id).save({ start: fcEvent.start, end: fcEvent.end });
        },
        destroy: function (event) {
            this.el.fullCalendar('removeEvents', event.id);
        }
    });

    var events = new Events();
    new EventsView({ el: $("#calendar"), collection: events }).render();
    events.fetch();

	
});

var EventView = Backbone.View.extend({
    el: $('#eventDialog'),
    initialize: function () {
        _.bindAll(this, _.functions(this));
    },
    render: function () {
        this.el.dialog({
            model: true,
            title: 'New Event',
            buttons: { 'Cancel': this.close }
        });
        return this;
    },
    close: function () {
        this.el.dialog('close');
    }
});