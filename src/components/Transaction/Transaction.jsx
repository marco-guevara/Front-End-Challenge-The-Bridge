import { useEffect, useState } from "react"
import TransactionPieChart from "../TransactionPieChart/TransactionPieChart"

function Transaction () {
  const [dataPie, setDataPie] = useState({name: '', value: 0})
  const [fraudPie, setFraudPie] = useState('')
  const [revisionPie, setRevisionPie] = useState('Si')
  const [analista, setAnalista] = useState('')
  const [typePie, setTypePie] = useState('')

  useEffect(() => {
    setDataPie([{name:'fraude', value:25, fill: '#FFBB28' },
                {name: '', value: 75}
    ])
    setFraudPie('No')
  }, [])

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
                { fraudPie ? <th>{fraudPie}</th> : null}
              </tr>
              <tr>
                <th>Require Revision</th>
                <th>{revisionPie}</th>
              </tr>
              <tr>
                <th>Tipo de Fraude</th>
                <th>{typePie}</th>
              </tr>
              <tr>
                <th>Analista</th>
                <th>{analista}</th>
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
                <th>{revisionPie}</th>
              </tr>
              <tr>
                <th>ID Usuario</th>
                <th>{typePie}</th>
              </tr>
              <tr>
                <th>Fecha</th>
                <th>{analista}</th>
              </tr>
              <tr>
                <th>Importe</th>
                <th>{analista}</th>
              </tr>
              <tr>
                <th>Categoria</th>
                <th>{analista}</th>
              </tr>
              <tr>
                <th>Hora</th>
                <th>{analista}</th>
              </tr>
            </table>
        </div>
        <div>
          <h3>Informacion de Pago</h3>
          <table>
              <tr>
                <th>Pais Pago</th>
                <th>{revisionPie}</th>
              </tr>
              <tr>
                <th>Tipo de Tarjeta</th>
                <th>{typePie}</th>
              </tr>
              <tr>
                <th>Online</th>
                <th>{analista}</th>
              </tr>
              <tr>
                <th>Mismo Envio/Facturacion</th>
                <th>{analista}</th>
              </tr>
              <tr>
                <th>VPN/Proxy</th>
                <th>{analista}</th>
              </tr>
              <tr>
                <th>3D Secure</th>
                <th>{analista}</th>
              </tr>
            </table>
        </div>
        <div>
          <h3>Dispositivos y Cuenta</h3>
          <table>
              <tr>
                <th>Tipo Dispositivo</th>
                <th>{revisionPie}</th>
              </tr>
              <tr>
                <th>Min desde ultima TX</th>
                <th>{typePie}</th>
              </tr>
              <tr>
                <th>Antiguidad Cuenta</th>
                <th>{analista}</th>
              </tr>
              <tr>
                <th>Email Verificado</th>
                <th>{analista}</th>
              </tr>
              <tr>
                <th>Pais Emiso</th>
                <th>{analista}</th>
              </tr>
            </table>
        </div>
      </div>
    </div>
  )
}

export default Transaction