/**
 * Human Resource API Routes Module
 *
 * This module defines API endpoints for human resource management.
 * All endpoints require authentication and are grouped under '인사관리' tag.
 */

const ApiRouter = require('../../default').ApiRouter
const ctrl = require('./humanResource-ctrl')

// 인사정보 생성
module.exports.createHumanResource = new ApiRouter({
  name: '',
  method: 'post',
  schema: 'request/humanResource/CreateHumanResource',
  summary: '인사정보 생성',
  tags: ['인사관리'],
  isPublic: false,
  apiType: ['user'],
  responses: {
    201: {description: '인사정보 생성 성공'},
    400: {description: 'Invalid data'},
    404: {description: '유저를 찾을 수 없습니다'},
    409: {description: '이미 존재하는 인사정보입니다'}
  },
  handler: ctrl.createHumanResource
})

// 인사정보에 등록되지 않은 인원들 조회
module.exports.getNoneRegisteredUsers = new ApiRouter({
  name: 'none-registered',
  method: 'get',
  schema: 'request/common/None',
  summary: '인사정보에 등록되지 않은 유저 목록 조회',
  tags: ['인사관리'],
  isPublic: true, // 임시로 public으로 변경
  apiType: ['user'],
  responses: {
    200: {description: '조회 성공'},
    400: {description: 'Invalid data'}
  },
  handler: ctrl.getNoneRegisteredUsers
})

// 인사정보 목록 조회
module.exports.getHumanResourceList = new ApiRouter({
  name: 'list',
  method: 'get',
  schema: 'request/humanResource/GetHumanResourceList',
  summary: '인사정보 목록 조회',
  tags: ['인사관리'],
  isPublic: false,
  apiType: ['user'],
  responses: {
    200: {description: '목록 조회 성공'},
    400: {description: 'Invalid data'}
  },
  handler: ctrl.getHumanResourceList
})

// 인사정보 상세 조회
module.exports.getHumanResourceDetail = new ApiRouter({
  name: ':human_resource_idx',
  path: ['human_resource_idx'],
  method: 'get',
  schema: 'request/humanResource/GetHumanResourceDetail',
  summary: '인사정보 상세 조회',
  tags: ['인사관리'],
  isPublic: false,
  apiType: ['user'],
  responses: {
    200: {description: '상세 조회 성공'},
    404: {description: '인사정보를 찾을 수 없습니다'}
  },
  handler: ctrl.getHumanResourceDetail
})

// 인사정보 수정
module.exports.updateHumanResource = new ApiRouter({
  name: ':human_resource_idx',
  path: ['human_resource_idx'],
  method: 'put',
  schema: 'request/humanResource/UpdateHumanResource',
  summary: '인사정보 수정',
  tags: ['인사관리'],
  isPublic: false,
  apiType: ['user'],
  responses: {
    200: {description: '수정 성공'},
    400: {description: 'Invalid data'},
    404: {description: '인사정보를 찾을 수 없습니다'}
  },
  handler: ctrl.updateHumanResource
})

// 인사정보 삭제
module.exports.deleteHumanResource = new ApiRouter({
  name: ':human_resource_idx',
  path: ['human_resource_idx'],
  method: 'delete',
  schema: 'request/humanResource/DeleteHumanResource',
  summary: '인사정보 삭제',
  tags: ['인사관리'],
  isPublic: false,
  apiType: ['user'],
  responses: {
    200: {description: '삭제 성공'},
    404: {description: '인사정보를 찾을 수 없습니다'}
  },
  handler: ctrl.deleteHumanResource
})

// 인사정보 계약 생성
module.exports.createHumanResourceContract = new ApiRouter({
  name: 'contract',
  method: 'post',
  schema: 'request/humanResource/CreateHumanResourceContract',
  summary: '인사정보 계약 생성',
  tags: ['인사관리'],
  isPublic: false,
  apiType: ['user'],
  responses: {
    201: {description: '계약 생성 성공'},
    400: {description: 'Invalid data'},
    404: {description: '인사정보를 찾을 수 없습니다'},
    409: {description: '해당 기간에 이미 계약이 존재합니다'}
  },
  handler: ctrl.createHumanResourceContract
})

// 인사정보 계약 수정
module.exports.updateHumanResourceContract = new ApiRouter({
  name: 'contract/:human_resource_contract_idx',
  path: ['human_resource_contract_idx'],
  method: 'put',
  schema: 'request/humanResource/UpdateHumanResourceContract',
  summary: '인사정보 계약 수정',
  tags: ['인사관리'],
  isPublic: false,
  apiType: ['user'],
  responses: {
    200: {description: '계약 수정 성공'},
    400: {description: 'Invalid data'},
    404: {description: '계약을 찾을 수 없습니다'}
  },
  handler: ctrl.updateHumanResourceContract
})

// 인사정보 계약 삭제
module.exports.deleteHumanResourceContract = new ApiRouter({
  name: 'contract/:human_resource_contract_idx',
  path: ['human_resource_contract_idx'],
  method: 'delete',
  schema: 'request/humanResource/DeleteHumanResourceContract',
  summary: '인사정보 계약 삭제',
  tags: ['인사관리'],
  isPublic: false,
  apiType: ['user'],
  responses: {
    200: {description: '계약 삭제 성공'},
    404: {description: '계약을 찾을 수 없습니다'}
  },
  handler: ctrl.deleteHumanResourceContract
})
