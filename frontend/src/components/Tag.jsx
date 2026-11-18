// tipo: 'ok' | 'warn' | 'bad' | '' (azul)
export default function Tag({ tipo = '', children }) {
  return <span className={`tag ${tipo}`}>{children}</span>
}
