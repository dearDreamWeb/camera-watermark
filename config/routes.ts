import { lazy } from 'react';
import { RouteConfig } from 'react-router-config';
import Index from '@/pages/index/index';
import Edit from '@/pages/edit/edit';
import EditList from '@/pages/editList/editList';

const routes: RouteConfig[] = [
  {
    exact: true,
    path: '/',
    component: Index,
  },
  {
    exact: true,
    path: '/editList',
    component: EditList,
  },
  {
    exact: true,
    path: '/edit',
    component: Edit,
  },
];
export default routes;
