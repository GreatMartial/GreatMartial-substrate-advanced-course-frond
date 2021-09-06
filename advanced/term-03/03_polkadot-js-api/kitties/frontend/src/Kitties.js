import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  const [count,setCount] = useState()
  const [dnaArr,setDnaArr] = useState([])
  const [ownerArr,setOwnerArr] = useState([])

  const fetchKitties = () => {
    // TODO: 在这里调用 `api.query.kittiesModule.*` 函数去取得猫咪的信息。
    // 你需要取得：
    //   - 共有多少只猫咪
    //   - 每只猫咪的主人是谁
    //   - 每只猫咪的 DNA 是什么，用来组合出它的形态
    async function fetchdata(){
      let kittiesList = [];
      let ownerList = [];  

      api.query.kittiesModule.kittiesCount(d=>{
        if(d.toHuman()>0){
          console.log(d.toHuman());
          setCount(d.toHuman());
          for(let i=0;i<d.toHuman();i++){
            api.queryMulti([
              [api.query.kittiesModule.owner,i],
              [api.query.kittiesModule.kitties,i]
            ],([ov,dv])=>{
              kittiesList.push(dv.unwrap().toU8a());
              setDnaArr(kittiesList);
              ownerList.push(ov.unwrap().toString());
              setOwnerArr(ownerList);
            });
          }
        }
      });
    }
    fetchdata()
  }

  const populateKitties = () => {
    // TODO: 在这里添加额外的逻辑。你需要组成这样的数组结构：
    //  ```javascript
    //  const kitties = [{
    //    id: 0,
    //    dna: ...,
    //    owner: ...
    //  }, { id: ..., dna: ..., owner: ... }]
    //  ```
    // 这个 kitties 会传入 <KittyCards/> 然后对每只猫咪进行处理
    async function popKitties(){
      let _kitties = [];
      setTimeout(()=>{
        console.log("owner---"+JSON.stringify(ownerArr));
        for(let i=0;i<count;i++){
          let arr = {
            id:i,
            dna:dnaArr[i],
            owner:ownerArr[i]
          };
          _kitties.push(arr);
        }
        setTimeout(()=>{
          setKitties(_kitties);
        },300);
      },300)
    }
    popKitties()
  }

  useEffect(fetchKitties, [api, keyring, status])
  useEffect(populateKitties, [ownerArr, dnaArr, kitties, status])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
