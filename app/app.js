$(function () {
    var flipSpeed = 0.15 * 2;

    $(window).on('keypress', function (e) {
        if (e.which === 32) {
            $(window).off('keypress');
            init();
        }
    });


    function init() {

        $(this).addClass("d-none");
        var winner = getRandomInt(1, 250);

        console.log("winner=", winner);
        countTo($('.counter-1'), Math.floor((winner / 100) % 10));
        countTo($('.counter-2'), Math.floor((winner / 10) % 10));
        countTo($('.counter-3'), Math.floor((winner / 1) % 10));


        setTimeout(function () {
            $(window).on('keypress', function (e) {
                if (e.which === 32) {
                    $(window).off('keypress');
                    init();
                }
            });

        }, (maxDigit(winner) + 1 + 20) * (1000 * flipSpeed));
    }

    function maxDigit(n) {
        if (n == 0) {
            return 0;
        }
        var remainder = n % 10
        return Math.max(remainder, maxDigit((n - remainder) * 1e-1));
    }

    function countTo(counterElm, to) {

        var counter = counterElm.removeClass("play");

        var activeflip = counter.find("ul.flip li.active:not(:first-child)").eq(0);
        if (activeflip.length) {
            counter.find("ul.flip li").removeClass("before");


            activeflip.addClass("before").removeClass("active");
            activeflip = counter.find("ul.flip li").eq(0);
            activeflip.addClass("active");

            counter.addClass("play");
        }

        var timer = 0;
        while (timer < to + 20) {
            timer++;
            setTimeout(function () {
                counterFLip(counterElm);
            }, timer * ((1000) * flipSpeed));
        }
    }


    function counterFLip(parent) {
        var counter = parent.removeClass("play");

        var activeflip = counter.find("ul.flip li.active").eq(0);
        if (!activeflip.length) {
            activeflip = counter.find("ul.flip li").eq(0);
        }
        counter.find("ul.flip li").removeClass("before");

        if (activeflip.is(":last-child")) {
            activeflip.addClass("before").removeClass("active");
            activeflip = counter.find("ul.flip li").eq(0);
            activeflip.addClass("active");

        }
        else {
            activeflip.addClass("before")
                .removeClass("active")
                .next("li")
                .addClass("active");
        }

        counter.addClass("play");

    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

});


