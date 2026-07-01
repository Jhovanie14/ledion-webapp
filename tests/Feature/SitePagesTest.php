<?php

use function Pest\Laravel\get;

test('the marketing home page renders', function () {
    get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('site/home'));
});

test('the booking placeholder page renders', function () {
    get('/booking')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('site/booking'));
});
