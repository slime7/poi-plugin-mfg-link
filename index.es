import {
  parseMaterial,
  parseItem,
  parseShip,
  parseDeckport,
  parseBasic,
  parseNdock,
  parseMapinfo,
  parseMapStart,
  parseBattleResult,
  parseUpdateShip,
  parseMapRoute,
  parseQuestList,
  parseCreateitem,
  parseDeleteKdock,
  parseKdock,
  parseCreateShip,
  parseRemodelSlot,
  parseMasterRemodel,
  parseRemodel,
  parseBookShip,
  parseBookItem
} from './mfg';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Row, Col, Grid, FormGroup, FormControl } from 'react-bootstrap';
const { config, log, getStore, i18n } = window;
const __ = i18n['poi-plugin-mfg-link'].__.bind(i18n['poi-plugin-mfg-link']);

const MFG_HOST = 'https://myfleet.iwmt.org/';
let [memberId, mfgPw, nicknameId, nickname] = [
  '',
  config.get('plugin.poi-plugin-mfg-sender.mfgpw', ''),
  '',
  ''
];
let auth, auth2, initPost = false, authSuccess = false;
let route = null, constructionData = null;
let lastRequestData = [
  [0, null], // 舰娘总数，最后一舰id
  [0], // 油
  [1, 0, 0, 0], // 第一舰队二号位id & 3个远征完成时间
  [0], // 提督经验
  [0, 0, 0, 0], // 维修完成时间
  [0, null] // 装备个数，最后一个装备的id
];

let mfgReq = ([path, data, resolve = null]) => {
  if (path !== '/post/v1/admiral_settings' && !authSuccess) {
    return;
  }
  const lastRequestDataPath = [
    '/post/v2/ship',
    '/post/v1/material',
    '/post/v1/deckport',
    '/post/v1/basic',
    '/post/v1/ndock',
    '/post/v1/slotitem'
  ];
  const lastRequestDataIndex = lastRequestDataPath.indexOf(path);

  switch (path) {
    case '/post/v2/ship':
      const shipCount = data.length, shipId = data[shipCount - 1].id;
      if (lastRequestData[lastRequestDataIndex][0] === shipCount
        && lastRequestData[lastRequestDataIndex][1] === shipId) {
        return;
      }
      lastRequestData[lastRequestDataIndex] = [shipCount, shipId];
      break;
    case '/post/v1/material':
      if (lastRequestData[lastRequestDataIndex][0] === data.fuel) {
        return;
      }
      lastRequestData[lastRequestDataIndex] = [data.fuel];
      break;
    case '/post/v1/deckport':
      if (lastRequestData[lastRequestDataIndex][0] === data[0].ships[1]
        && lastRequestData[lastRequestDataIndex][1] === data[1].mission.completeTime
        && lastRequestData[lastRequestDataIndex][2] === data[2].mission.completeTime
        && lastRequestData[lastRequestDataIndex][3] === data[3].mission.completeTime) {
        return;
      }
      lastRequestData[lastRequestDataIndex] = [
        data[0].ships[1],
        data[1].mission.completeTime,
        data[2].mission.completeTime,
        data[3].mission.completeTime
      ];
      break;
    case '/post/v1/basic':
      if (lastRequestData[lastRequestDataIndex][0] === data.experience) {
        return;
      }
      lastRequestData[lastRequestDataIndex] = [data.experience];
      break;
    case '/post/v1/ndock':
      if (lastRequestData[lastRequestDataIndex][0] === data[0].completeTime
        && lastRequestData[lastRequestDataIndex][1] === data[1].completeTime
        && lastRequestData[lastRequestDataIndex][2] === data[2].completeTime
        && lastRequestData[lastRequestDataIndex][3] === data[3].completeTime) {
        return;
      }
      lastRequestData[lastRequestDataIndex] = [
        data[0].completeTime,
        data[1].completeTime,
        data[2].completeTime,
        data[3].completeTime
      ];
      break;
    case '/post/v1/slotitem':
      const itemCount = data.length, itemId = data[itemCount - 1].id;
      if (lastRequestData[lastRequestDataIndex][0] === itemCount
        && lastRequestData[lastRequestDataIndex][1] === itemId) {
        return;
      }
      lastRequestData[lastRequestDataIndex] = [itemCount, itemId];
      break;
  }

  let postHeaders = new Headers();
  postHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
  const postData = 'auth=' + encodeURIComponent(JSON.stringify(auth))
    + '&auth2=' + encodeURIComponent(JSON.stringify(auth2))
    + '&data=' + encodeURIComponent(JSON.stringify(data));
  fetch(MFG_HOST + path,
    {
      method: 'POST',
      headers: postHeaders,
      body: postData
    })
    .then(function (response) {
      if (typeof resolve === 'function') {
        resolve(response);
      }
    }).catch(function (e) {
      // pass
    });
}

let handleGameResponse = (e) => {
  let { path, body, postBody } = e.detail ? e.detail : e;
  let kcServer = {};
  if (!!getStore('info').server.id && !initPost) {
    kcServer = {
      number: getStore('info').server.id,
      ip: getStore('info').server.ip,
      name: getStore('info').server.name
    };
  }
  if (mfgPw !== '' && !initPost && !!kcServer.number && memberId !== '') {
    auth = { id: nicknameId, nickname: nickname, memberId: memberId };
    auth2 = { id: memberId, pass: mfgPw };

    initPost = true;
    mfgReq(['/post/v1/admiral_settings', kcServer, (response) => {
      if (response.ok) {
        authSuccess = true;
        const welcome = __('%s, welcome, My Fleet Girls Link has started.', nickname);
        log(welcome);
      }
    }])
  }

  switch(path) {
    case 'kcsapi/api_start2':
      // TODO: init on refresh
    break;

    /**
     * 母港
     * 发送大部分信息
     */
    case '/kcsapi/api_port/port':
      if (memberId === '' || nicknameId === '' || nickname === '') {
        memberId = parseInt(body.api_basic.api_member_id);
        nicknameId = parseInt(body.api_basic.api_nickname_id);
        nickname = body.api_basic.api_nickname;
      }
      route = null;
      constructionData;
      mfgReq(parseShip());
      mfgReq(parseMaterial());
      mfgReq(parseDeckport());
      mfgReq(parseBasic());
      mfgReq(parseNdock());
      mfgReq(parseItem());
      break;

    /**
     * 资源
     */
    case '/kcsapi/api_get_member/material':
      mfgReq(parseMaterial());
      break;

    /**
     * 出击界面
     */
    case '/kcsapi/api_get_member/mapinfo':
      mfgReq(parseMapinfo());
      break;

    /**
     * 舰队编队
     */
    case '/kcsapi/api_req_hensei/change':
      mfgReq(parseDeckport());
      break;

    /**
     * 开始出击
     */
    case '/kcsapi/api_req_map/start':
      let reqData = parseMapStart(body);
      route = reqData[1];
      mfgReq(reqData);
      break;

    /**
     * 战斗结果
     */
    case '/kcsapi/api_req_sortie/battleresult':
    case '/kcsapi/api_req_combined_battle/battleresult':
      if (route) {
        mfgReq(parseBattleResult(body, route));
      }
      break;

    /**
    * 获得、换装备
    */
    case '/kcsapi/api_get_member/ship_deck':
    case '/kcsapi/api_get_member/ship3':
      mfgReq(parseUpdateShip(body.api_ship_data));
      break;

    /**
   * 罗盘
   */
    case '/kcsapi/api_req_map/next':
      if (route) {
        mfgReq(parseMapRoute(body, route));
        Object.assign(route, {
          no: body.api_no,
          next: body.api_next
        });
      }
      break;

    /**
    * 任务
    */
    case '/kcsapi/api_get_member/questlist':
      mfgReq(parseQuestList(body.api_list.filter(x => x !== -1)));
      break;

    /**
    * 编队信息
    */
    case '/kcsapi/api_get_member/deck':
      mfgReq(parseDeckport());
      break;

    /**
     * 开发
     */
    case '/kcsapi/api_req_kousyou/createitem':
      mfgReq(parseCreateitem(body, postBody));
      break;

    /**
     * 建造获取
     */
    case '/kcsapi/api_req_kousyou/getship':
      mfgReq(parseDeleteKdock(body, postBody));
      break;

    /**
     * 建造渠
     */
    case '/kcsapi/api_get_member/kdock':
      const kdockRequest = parseKdock(constructionData);
      kdockRequest.map(x => mfgReq(x));
      constructionData = null;
      break;

    /**
     * 建造
     */
    case '/kcsapi/api_req_kousyou/createship':
      const flagShip = getStore('info').fleets[0].api_ship[0];
      constructionData = {
        createShip: {
          fuel: parseInt(postBody.api_item1),
          ammo: parseInt(postBody.api_item2),
          steel: parseInt(postBody.api_item3),
          bauxite: parseInt(postBody.api_item4),
          develop: parseInt(postBody.api_item5),
          kDock: parseInt(postBody.api_kdock_id),
          highspeed: !!parseInt(postBody.api_highspeed),
          largeFlag: !!parseInt(postBody.api_large_flag),
          firstShip: flagShip
        }
      };
      break;

    /**
     * 改造列表
     */
    case '/kcsapi/api_req_kousyou/remodel_slotlist':
      mfgReq(parseRemodelSlot(body));
      break;

    /**
     * 改造详情
     */
    case '/kcsapi/api_req_kousyou/remodel_slotlist_detail':
      mfgReq(parseMasterRemodel(body, postBody));
      break;

    /**
     * 进行改造
     */
    case '/kcsapi/api_req_kousyou/remodel_slot':
      mfgReq(parseRemodel(body, postBody));
      break;

    /**
     * 图鉴
     */
    case '/kcsapi/api_get_member/picture_book':
      switch (parseInt(postBody.api_type)) {
        case 1:
          mfgReq(parseBookShip(body));
          break;
        case 2:
          mfgReq(parseBookItem(body));
          break;
      }
      break;
  }
}

const MfgConfig = connect(
  (state, props) => ({
    value: get(state.config, props.configName, props.defaultVal),
    configName: props.configName,
    label: props.label,
  })
)(class mfgConfig extends Component {
  static propTypes = {
    label: PropTypes.string,
    configName: PropTypes.string,
    value: PropTypes.string,
  };
  pwChange = () => {
    config.set(this.props.configName, this.input.value);
  }
  render() {
    return (
      <Row>
        <Col xs={12} >
          <Grid>
            <Col xs={12} >
              <FormGroup>
                <FormControl
                  type="password"
                  value={this.props.value}
                  inputRef={ref => this.input = ref}
                  onChange={this.pwChange}
                  placeholder={this.props.label}
                />
              </FormGroup>
            </Col>
          </Grid>
        </Col>
      </Row>
    );
  }
});

export const
  pluginDidLoad = (e) => {
    window.addEventListener('game.response', handleGameResponse);
  },
  pluginWillUnload = (e) => {
    window.removeEventListener('game.response', handleGameResponse);
  };

export const settingsClass = () => (
  <div>
    <MfgConfig
      label={__('MFG Password')}
      configName="plugin.poi-plugin-mfg-sender.mfgpw"
      defaultVal=""
    />
  </div>
);
