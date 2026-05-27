import { useEffect, useState } from "react"
import TransactionPieChart from "../TransactionPieChart/TransactionPieChart"
import { useLocation } from "react-router-dom"
import { getTransactionById } from "../../services/api"


function Transaction () {
  const location = useLocation()
  const [dataPie, setDataPie] = useState({name: '', value: 0})
  const [fraudPie, setFraudPie] = useState('')
  const [revisionPie, setRevisionPie] = useState('Si')
  const [analista, setAnalista] = useState('')
  const [typePie, setTypePie] = useState('')
  const [transaction, setTransaction] = useState({})
  const transactionId = location.state.transaction


  

  useEffect(() => {
    console.log(transactionId.id)
    const getTransaction = async () => {
      const res = await getTransactionById(transactionId.id)
      console.log(res)
      setTransaction(res)
    }
    getTransaction()
    
    setFraudPie('No')

  }, [])

  useEffect(() => {
    console.log('aqui')
    console.log(transaction)
    if (transaction) {
      console.log(transaction.f_score)
      setDataPie([{name:'fraude', value:transaction.f_score * 100, fill: '#FFBB28' },
                {name: '', value: 100-transaction.f_score * 100}
    ])
  }
  }, [transaction])

  return (
    <div>
      <div>
        <button>Marcar como Legitima</button>
        <button>Marcar como Fraude</button>
      </div>
      <div>
        <div>
          { dataPie ? <TransactionPieChart
            data={dataPie}
          /> : null }
          <div>
            <table>
              <tr>
                { dataPie  ? <th>Es Fraude</th> : null}
                { transaction.es_fraude ? <th>Si</th> : <th>No</th>}
              </tr>
              <tr>
                <th>Require Revision</th>
                { transaction ? <th>{transaction?.revisado}</th> : null}
              </tr>
              <tr>
                <th>Tipo de Fraude</th>
                { transaction ? <th>{transaction?.shap_reasons?.razones_fraude[1]}</th> : null}
              </tr>
              <tr>
                <th>Analista</th>
                { transaction ? <th>{transaction?.analista}</th> : null}
              </tr>
            </table>
          </div>
        </div>
        <div>
          <h3>Explicabilidad</h3>
        </div>
      </div>
      <div>
        <div>
          <h3>Informacion General</h3>
          <table>
              <tr>
                <th>ID Transaccion</th>
                { transaction ? <th>{transaction.id_transaccion}</th> : null}
              </tr>
              <tr>
                <th>ID Usuario</th>
                { transaction ? <th>{transaction.id_usuario}</th> : null}
              </tr>
              <tr>
                <th>Fecha</th>
                { transaction ? <th>{transaction.fecha}</th> : null}
              </tr>
              <tr>
                <th>Importe</th>
                { transaction ? <th>{transaction.importe}</th> : null}
              </tr>
              <tr>
                <th>Categoria</th>
                { transaction ? <th>{transaction.categoria}</th> : null}
              </tr>
              <tr>
                <th>Hora</th>
                { transaction ? <th>{transaction.hora}</th> : null}
              </tr>
            </table>
        </div>
        <div>
          <h3>Informacion de Pago</h3>
          <table>
              <tr>
                <th>Pais Pago</th>
                { transaction ? <th>{transaction?.pais_pago}</th> : null}
              </tr>
              <tr>
                <th>Tipo de Tarjeta</th>
                { transaction ? <th>{transaction?.tipo_tarjeta}</th> : null}
              </tr>
              <tr>
                <th>Online</th>
                { transaction?.es_online ? <th>Si</th> : <th>No</th>}
              </tr>
              <tr>
                <th>Mismo Envio/Facturacion</th>
                { transaction?.mismo_envio_facturacion ? <th>Si</th> : <th>No</th>}
              </tr>
              <tr>
                <th>VPN/Proxy</th>
                { transaction?.uso_vpn_proxy ? <th>Si</th> : <th>No</th>}
              </tr>
              <tr>
                <th>3D Secure</th>
                { transaction?.paso_3d_secure ? <th>Si</th> : <th>No</th>}
              </tr>
            </table>
        </div>
        <div>
          <h3>Dispositivos y Cuenta</h3>
          <table>
              <tr>
                <th>Tipo Dispositivo</th>
                { transaction ? <th>{transaction?.tipo_dispositivo}</th> : null}
              </tr>
              <tr>
                <th>Min desde ultima TX</th>
                { transaction ? <th>{transaction?.minutos_desde_ultima_tx}</th> : null}
              </tr>
              <tr>
                <th>Antiguidad Cuenta (Dias)</th>
                { transaction ? <th>{transaction?.dias_antiguedad_cuenta}</th> : null}
              </tr>
              <tr>
                <th>Email Verificado</th>
                { transaction?.email_verificado ? <th>Si</th> : <th>No</th>}
              </tr>
              <tr>
                <th>Pais Emiso</th>
                { transaction ? <th>{transaction?.pais_emision}</th> : null}
              </tr>
            </table>
        </div>
      </div>
    </div>
  )
}

export default Transaction