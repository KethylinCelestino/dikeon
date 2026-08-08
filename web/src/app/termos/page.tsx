import Link from "next/link";
import type { Metadata } from "next";
import { Legal } from "@/components/Legal";

/**
 * MINUTA. Precisa de revisão jurídica antes de publicar, em especial quanto
 * à limitação de responsabilidade e à cláusula de foro. Os campos entre
 * colchetes precisam ser preenchidos.
 */

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Regras de uso do Dikeon, plataforma de estudo para o Exame de Ordem " +
    "da OAB. Material educativo, sem natureza de consultoria jurídica.",
  alternates: { canonical: "/termos" },
};

const CONTATO = "contato@dikeon.com.br";

export default function Termos() {
  return (
    <Legal titulo="Termos de Uso" atualizadoEm="8 de agosto de 2026">
      <p>
        Estes termos regem o uso do Dikeon (dikeon.com.br), plataforma de
        estudo para o Exame de Ordem Unificado, operada por{" "}
        <strong>[RAZÃO SOCIAL]</strong>, CNPJ <strong>[CNPJ]</strong>. Ao usar
        a plataforma, você concorda com eles. Se não concordar, não use o
        serviço.
      </p>

      <h2>1. Material educativo, não consultoria jurídica</h2>
      <p>
        Esta é a cláusula mais importante deste documento.
      </p>
      <p>
        Todo o conteúdo do Dikeon — questões, comentários, flashcards, textos
        legais e respostas da tutora Zel — tem{" "}
        <strong>finalidade exclusivamente educativa</strong>, voltada à
        preparação para o Exame de Ordem. Nada aqui constitui consultoria,
        parecer, orientação ou assistência jurídica, nem cria relação de
        advogado e cliente entre você e o Dikeon ou qualquer pessoa ligada a
        ele.
      </p>
      <p>
        Não use este material para decidir sobre um caso concreto, seu ou de
        terceiros. Para isso, procure um advogado inscrito na OAB.
      </p>

      <h2>2. Sobre a exatidão do conteúdo</h2>
      <p>
        Os comentários das questões e os flashcards são{" "}
        <strong>gerados por inteligência artificial</strong> a partir do
        gabarito oficial da banca, e podem conter imprecisões, inclusive em
        citações de artigos e súmulas. As respostas da Zel também são geradas
        por inteligência artificial e estão sujeitas ao mesmo risco.
      </p>
      <p>
        Confira sempre o dispositivo legal na fonte oficial antes de tomar
        qualquer coisa como certa. O texto legal reproduzido no Vade Mecum vem
        de uma edição publicada e pode não refletir alterações posteriores; a
        redação vigente é a do Diário Oficial e do portal do Planalto.
      </p>
      <p>
        Questões afetadas por mudança legislativa são sinalizadas e ficam
        ocultas por padrão, mas essa triagem também é automatizada e não é
        infalível.
      </p>

      <h2>3. Nenhuma garantia de aprovação</h2>
      <p>
        O Dikeon é uma ferramenta de estudo. Não prometemos, garantimos nem
        sugerimos qualquer resultado no Exame de Ordem. O desempenho na prova
        depende de fatores que estão fora do nosso controle.
      </p>

      <h2>4. Sua conta</h2>
      <ul>
        <li>
          A conta é pessoal e intransferível. Você responde pelo que acontece
          nela.
        </li>
        <li>
          Você pode encerrá-la quando quiser, escrevendo para{" "}
          <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
        </li>
        <li>
          Podemos suspender ou encerrar contas que violem estes termos,
          preferencialmente com aviso prévio.
        </li>
        <li>
          Usar o Dikeon sem conta é possível, mas nesse caso o progresso fica
          só no navegador e se perde ao limpá-lo.
        </li>
      </ul>

      <h2>5. Uso aceitável</h2>
      <p>Ao usar a plataforma, você concorda em não:</p>
      <ul>
        <li>
          extrair o acervo de forma automatizada nem reproduzir o conteúdo do
          Dikeon em outro serviço, com ou sem fim comercial;
        </li>
        <li>
          contornar limitações técnicas, sobrecarregar a infraestrutura ou
          tentar acessar dados de outras pessoas;
        </li>
        <li>
          usar a Zel para finalidade estranha ao estudo para o Exame de Ordem.
        </li>
      </ul>

      <h2>6. Conteúdo e propriedade intelectual</h2>
      <p>
        As provas do Exame de Ordem Unificado são documentos de concurso
        público, de divulgação oficial e acesso livre. O Dikeon as reproduz
        para fins de estudo, com indicação do exame e do número de cada
        questão.
      </p>
      <p>
        Já os comentários, flashcards, a organização por matéria e tema, o
        código, a marca e o design do Dikeon são de titularidade de{" "}
        <strong>[RAZÃO SOCIAL]</strong> e não podem ser reproduzidos sem
        autorização.
      </p>
      <p>
        Se você entende que algum conteúdo publicado aqui viola direitos,
        escreva para <a href={`mailto:${CONTATO}`}>{CONTATO}</a> e
        analisaremos o pedido.
      </p>

      <h2>7. Disponibilidade e mudanças</h2>
      <p>
        A plataforma é oferecida no estado em que se encontra. Podemos alterar,
        suspender ou descontinuar funcionalidades, e não garantimos
        funcionamento ininterrupto ou livre de erros. Faremos o possível para
        avisar sobre mudanças relevantes.
      </p>

      <h2>8. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, o Dikeon não responde por danos
        decorrentes do uso ou da impossibilidade de uso da plataforma,
        incluindo decisões tomadas com base no conteúdo educativo aqui
        publicado. Esta limitação não afasta os direitos que a legislação
        consumerista garante a você de forma inafastável.
      </p>

      <h2>9. Privacidade</h2>
      <p>
        O tratamento dos seus dados pessoais está descrito na{" "}
        <Link href="/privacidade">Política de Privacidade</Link>, que integra
        estes termos.
      </p>

      <h2>10. Lei aplicável e foro</h2>
      <p>
        Estes termos são regidos pela lei brasileira. Fica eleito o foro da
        comarca de <strong>[CIDADE/UF]</strong> para dirimir controvérsias,
        ressalvado o direito do consumidor de demandar no foro do seu próprio
        domicílio.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas sobre estes termos:{" "}
        <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
      </p>

      <p className="pt-4">
        <Link href="/privacidade">Ver também a Política de Privacidade</Link>
      </p>
    </Legal>
  );
}
