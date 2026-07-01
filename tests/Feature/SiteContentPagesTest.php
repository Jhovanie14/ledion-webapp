<?php

use function Pest\Laravel\get;

beforeEach(function () {
    // Page components are added in later tasks; assert only the server-side
    // Inertia component contract for now. The override is removed in Task 8.
    config(['inertia.testing.ensure_pages_exist' => false]);
});

dataset('content pages', [
    ['/services', 'site/services/index'],
    ['/pricing', 'site/pricing'],
    ['/gallery', 'site/gallery'],
    ['/about', 'site/about'],
    ['/faq', 'site/faq'],
    ['/contact', 'site/contact'],
]);

test('content pages render', function (string $url, string $component) {
    get($url)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component($component));
})->with('content pages');

test('the service detail page renders for a known slug', function () {
    get('/services/ceramic-coating')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/services/show')
            ->where('slug', 'ceramic-coating'));
});
