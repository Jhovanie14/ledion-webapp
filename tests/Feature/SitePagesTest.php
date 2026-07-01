<?php

use function Pest\Laravel\get;

beforeEach(function () {
    // The `site/home` and `site/booking` page components are added in a later task;
    // this test only asserts the server-side Inertia component contract.
    config(['inertia.testing.ensure_pages_exist' => false]);
});

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
