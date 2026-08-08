import Link from "next/link";
import type { Metadata } from "next";
import { Legal } from "@/components/Legal";

/**
 * MINUTA. Escrita a partir do que o código realmente coleta, mas não
 * substitui revisão jurídica — em especial quanto à base legal de cada
 * tratamento e à transferência internacional. Os campos entre colchetes
 * precisam ser preenchidos antes de publicar.
 */

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Dikeon trata os dados pessoais de quem estuda na plataforma, " +
    "conforme a Lei Geral de Proteção de Dados.",
  alternates: { canonical: "/privacidade" },
};

const CONTATO = "privacidade@dikeon.com.br";

export default function Privacidade() {
  return (
    <Legal titulo="Política de Privacidade" atualizadoEm="8 de agosto de 2026">
      <p>
        Esta política explica quais dados pessoais o Dikeon coleta, por que
        coleta, com quem compartilha e o que você pode exigir a respeito
        deles. Ela segue a Lei nº 13.709/2018, a Lei Geral de Proteção de
        Dados (LGPD).
      </p>
      <p>
        O controlador dos dados é <strong>[RAZÃO SOCIAL]</strong>, inscrita no
        CNPJ sob o nº <strong>[CNPJ]</strong>, responsável pelo Dikeon
        (dikeon.com.br). Para qualquer assunto desta política, incluindo o
        exercício dos seus direitos, escreva para{" "}
        <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
      </p>

      <h2>1. Quais dados coletamos</h2>

      <h3>Se você usa o Dikeon sem conta</h3>
      <p>
        Não coletamos nada que identifique você. Suas respostas, seu progresso
        e o estado dos seus flashcards ficam guardados apenas no seu próprio
        navegador, e nós não temos acesso a eles. Apagar os dados do navegador
        apaga esse histórico definitivamente.
      </p>

      <h3>Se você cria uma conta</h3>
      <ul>
        <li>
          <strong>Dados de cadastro:</strong> endereço de e-mail e, se você
          optar por entrar com o Google, nome e foto de perfil associados
          àquela conta.
        </li>
        <li>
          <strong>Histórico de estudo:</strong> quais questões você respondeu,
          a alternativa escolhida, se acertou, a matéria e a data e hora de
          cada resposta.
        </li>
      </ul>

      <h3>Em qualquer caso</h3>
      <ul>
        <li>
          <strong>Dados técnicos de acesso:</strong> nosso provedor de
          hospedagem registra endereço IP, tipo de navegador e páginas
          visitadas, como é padrão em qualquer site, para segurança e
          diagnóstico de falhas.
        </li>
        <li>
          <strong>Preferências locais:</strong> guardamos no seu navegador a
          escolha entre tema claro e escuro. Não usamos cookies de publicidade
          nem de rastreamento entre sites.
        </li>
      </ul>

      <h2>2. Por que tratamos esses dados</h2>
      <ul>
        <li>
          <strong>Para executar o serviço que você contratou</strong> (art. 7º,
          V, da LGPD): manter sua conta, guardar seu progresso e devolvê-lo
          quando você entra de outro aparelho.
        </li>
        <li>
          <strong>Por legítimo interesse</strong> (art. 7º, IX): manter a
          plataforma segura e funcionando, diagnosticar erros e entender de
          forma agregada quais partes do produto são usadas.
        </li>
        <li>
          <strong>Com o seu consentimento</strong> (art. 7º, I): quando você
          escolhe conversar com a Zel, nossa tutora de inteligência
          artificial, e o resumo do seu desempenho é enviado junto com a
          pergunta.
        </li>
      </ul>
      <p>
        Não vendemos dados pessoais, não os cedemos para publicidade e não
        traçamos perfis para fins comerciais.
      </p>

      <h2>3. Com quem compartilhamos</h2>
      <p>
        Usamos serviços de terceiros para operar a plataforma. Cada um recebe
        apenas o necessário para a sua função:
      </p>
      <ul>
        <li>
          <strong>Clerk</strong> — autenticação. Recebe e guarda seu e-mail e
          os dados de login.
        </li>
        <li>
          <strong>Neon</strong> — banco de dados. Guarda seu histórico de
          estudo, associado a um identificador de usuário.
        </li>
        <li>
          <strong>Vercel</strong> — hospedagem. Processa as requisições e
          mantém os registros técnicos de acesso.
        </li>
        <li>
          <strong>Anthropic</strong> — inteligência artificial da Zel. Recebe
          sua mensagem e um resumo do seu desempenho por matéria, apenas
          quando você usa o chat. Não enviamos seu e-mail nem seu nome.
        </li>
      </ul>

      <h3>Transferência internacional</h3>
      <p>
        Todos esses fornecedores operam fora do Brasil, e seus dados são
        armazenados e processados nos Estados Unidos. A transferência ocorre
        nos termos do art. 33 da LGPD, com base na execução do contrato entre
        você e o Dikeon e nas garantias contratuais oferecidas por cada
        fornecedor. Se você não concorda com isso, use a plataforma sem criar
        conta: nesse caso nada seu sai do seu navegador.
      </p>

      <h2>4. Por quanto tempo guardamos</h2>
      <p>
        Mantemos sua conta e seu histórico enquanto ela existir. Se você pedir
        a exclusão, apagamos os dados em até 30 dias, salvo o que precisarmos
        reter por obrigação legal. Registros técnicos de acesso são mantidos
        por 6 meses, prazo previsto no Marco Civil da Internet.
      </p>

      <h2>5. Seus direitos</h2>
      <p>
        O art. 18 da LGPD garante a você, a qualquer momento e sem custo,
        pedir:
      </p>
      <ul>
        <li>confirmação de que tratamos seus dados e acesso a eles;</li>
        <li>correção de dados incompletos ou desatualizados;</li>
        <li>
          anonimização, bloqueio ou eliminação de dados desnecessários ou
          tratados fora da lei;
        </li>
        <li>portabilidade dos seus dados para outro serviço;</li>
        <li>eliminação dos dados tratados com base no seu consentimento;</li>
        <li>informação sobre com quem compartilhamos seus dados;</li>
        <li>revogação do consentimento.</li>
      </ul>
      <p>
        Para exercer qualquer um deles, escreva para{" "}
        <a href={`mailto:${CONTATO}`}>{CONTATO}</a>. Respondemos em até 15
        dias. Você também pode reclamar à Autoridade Nacional de Proteção de
        Dados (ANPD).
      </p>

      <h2>6. Segurança</h2>
      <p>
        O acesso ao banco de dados é restrito e todo o tráfego é criptografado.
        Não armazenamos senhas: a autenticação é feita pelo Clerk. Ainda
        assim, nenhum sistema é imune a incidentes. Se houver vazamento com
        risco relevante a você, comunicaremos você e a ANPD, como manda o art.
        48 da LGPD.
      </p>

      <h2>7. Menores de idade</h2>
      <p>
        O Dikeon é destinado a maiores de 18 anos, por se dirigir a bacharéis
        e estudantes de Direito. Não coletamos intencionalmente dados de
        crianças e adolescentes. Se identificarmos um cadastro nessa
        situação, ele será excluído.
      </p>

      <h2>8. Mudanças nesta política</h2>
      <p>
        Se mudarmos algo relevante, atualizaremos a data no topo desta página
        e avisaremos por e-mail quem tiver conta. O uso continuado depois do
        aviso significa concordância com a versão nova.
      </p>

      <p className="pt-4">
        <Link href="/termos">Ver também os Termos de Uso</Link>
      </p>
    </Legal>
  );
}
