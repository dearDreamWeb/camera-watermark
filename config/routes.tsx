import React, { lazy } from 'react';
// import Index from '@/pages/index/index';
// import Edit from '@/pages/edit/edit';
// import EditList from '@/pages/editList/editList';
import { RouteObject } from 'react-router-dom';

const Index = lazy(() => import('@/pages/index/index'));
const Edit = lazy(() => import('@/pages/edit/edit'));
const EditList = lazy(() => import('@/pages/editList/editList'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/editList',
    element: <EditList />,
  },
  {
    path: '/edit',
    element: <Edit />,
  },
];
export default routes;
