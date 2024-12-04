import { redirect } from '@sveltejs/kit';
export const ssr = false;
export const prerender = true;

export const load = async () => {
    redirect(302, '/home');
};