<?php

use function Pest\Laravel\get;

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
