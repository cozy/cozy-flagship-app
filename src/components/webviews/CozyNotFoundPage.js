import { makeErrorPage } from '/components/makeErrorPage'
import { t } from '/locales/i18n'

export const CozyNotFoundPage = () =>
  makeErrorPage({
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="236" height="96"><g fill="none" fill-rule="evenodd"><path fill="#B3D3FF" fill-opacity=".24" d="M201.629 24.954C196.57 13.4 184.313 5.857 170.714 2.824c-8.974-2-18.555-2.516-27.779-2.746-9.844-.246-19.698.107-29.502.825-9.525.697-19.01 1.748-28.447 3.04-9.16 1.255-18.56 2.137-27.205 5.173-7.99 2.807-19.041 6.746-27.8 23.419-6.43 12.242-3.063 28.078 5.856 39.207 15.96 19.92 46.844 20.677 72.173 19.971 7.392-.206 14.844-.312 22.185-1.088a160.477 160.477 0 0 0 27.241-5.286c8.107-2.32 16.379-5.189 23.325-9.517 6.103-3.802 10.902-8.74 14.551-14.385 7.122-11.017 11.726-24.129 6.317-36.483"/><path fill="#66E475" d="M41.817 62.454v3.23H39.48V47.793a4.064 4.064 0 0 0-4.067-4.062 4.063 4.063 0 0 0-4.065 4.062v10.524h-2.895v-3.231a4.064 4.064 0 0 0-4.066-4.062 4.064 4.064 0 0 0-4.066 4.062v7.294a4.063 4.063 0 0 0 4.066 4.061h6.96l.068 22.12h8.132L39.48 73.81h6.402a4.064 4.064 0 0 0 4.067-4.062v-7.293a4.064 4.064 0 0 0-4.067-4.062 4.063 4.063 0 0 0-4.065 4.062z"/><path fill="#FFE4B5" d="M.869 95.76s41.956-18.705 49.107-18.705c7.152 0 27.086 9.153 27.086 9.153s26.45-3.756 28.945-3.756c2.495 0 36.6 13.341 36.6 13.341L.869 95.76z"/><path fill="#FFE4B5" d="M93.119 95.754s33.518-12.44 41.275-12.44c7.756 0 29.376 6.095 29.376 6.095s28.686-2.501 31.392-2.501c2.706 0 39.695 8.885 39.695 8.885l-141.738-.04z"/><path fill="#F7FAFF" d="M166.336 29.763c0 9.667-7.844 17.504-17.521 17.504-9.676 0-17.522-7.837-17.522-17.504 0-9.668 7.846-17.505 17.522-17.505 9.677 0 17.521 7.837 17.521 17.505"/><path fill="#66E475" d="M205.507 54.829c-3.81 0-6.9 3.087-6.9 6.894v5.484h-3.967V36.838a6.898 6.898 0 0 0-6.9-6.894 6.898 6.898 0 0 0-6.902 6.894v17.863h-4.913v-5.484c0-3.808-3.09-6.895-6.901-6.895s-6.901 3.087-6.901 6.895v12.378a6.898 6.898 0 0 0 6.9 6.894h11.815v27.26h13.802V80.996h10.867a6.897 6.897 0 0 0 6.901-6.894V61.723a6.898 6.898 0 0 0-6.9-6.894"/><path fill="#FFC35C" d="M87.878 83.472c-1.418 2.151-3.495 3.838-5.803 4.96-2.111 1.026-4.412 1.547-6.765 1.702a17.23 17.23 0 0 0 4.692-2.155 26.43 26.43 0 0 0 2.187-.99c2.804-1.428 5.38-3.494 6.987-6.236l.032-.056a11.137 11.137 0 0 1-1.33 2.775m-30.433 1.482c-2.093-2.108-2.64-4.931-2.21-7.806.036-.236.077-.475.12-.715.133.527.284 1.042.447 1.541.945 2.895 2.586 5.627 5.137 7.374l.14.094c.19.163.383.323.585.476a9.426 9.426 0 0 0 2.114 2.577c-2.306-.741-4.61-1.806-6.333-3.54m5.76-21.251c-.089.088-.177.177-.263.267a9.943 9.943 0 0 0-2.85 1.117c-.59.35-1.122.762-1.605 1.222.092-.09.186-.18.281-.267 1.323-1.196 2.83-1.931 4.436-2.34m10.177-2.753c.64.139 1.258.354 1.856.616a17.432 17.432 0 0 0-3.588.668c-.211-.002-.421 0-.632.004a28.666 28.666 0 0 0-3.118-.345c.427-.224.867-.423 1.321-.587 1.335-.48 2.764-.66 4.16-.356m7.98 2.685-.103-.028-.007-.004c.037.01.073.02.11.032m8.557 5.837c.882 1.294 1.143 2.677.79 4.196a2.338 2.338 0 0 0-.026-.114 10.69 10.69 0 0 0-.211-1.187 9.338 9.338 0 0 0-.9-2.33c-.473-1.108-1.085-2.148-1.912-3.031.862.73 1.636 1.553 2.259 2.466m-24.814-4.378c.295-.022.591-.033.888-.04a18.85 18.85 0 0 0-3.496 3.338c-.383.211-.75.45-1.094.723.185-.492.422-.97.717-1.424.722-1.11 1.737-1.962 2.891-2.59l.094-.007m14.38 3.134c-3.246-1.704-7.03-1.666-10.594-1.392-1.132.087-2.306.221-3.444.48a17.32 17.32 0 0 1 2.99-2.182c2.092.18 4.178.63 6.16 1.204 2.813.815 5.837 1.916 7.972 4 1.848 1.804 3.018 4.85 1.59 7.256-.033.055-.068.108-.102.16a8.792 8.792 0 0 0 .27-2.25c-.04-3.187-2.087-5.831-4.841-7.276m-.8 11.97c.052-.098.1-.198.143-.302.173-.411.278-.828.328-1.242.673-.29 1.26-.762 1.64-1.407.687-1.169.495-2.626-.27-3.707-.778-1.097-1.995-1.869-3.343-2a2.662 2.662 0 0 0-.177-.01 5.664 5.664 0 0 0-1.2-.419c-2.731-2.198-6.332-2.471-9.72-2.31-.363.017-.73.044-1.09.095.262-.081.529-.153.8-.214 1.47-.332 2.988-.433 4.49-.513 1.683-.088 3.397-.106 5.063.184 2.622.456 5.285 1.703 6.69 4.069 1.325 2.233.99 4.954-.24 7.144-.97.409-2.06.593-3.113.632m-7.192-8.592c-.752-.52-1.587-.888-2.471-1.039-2.265-.383-4.96 1.025-5.6 3.264-.285-.948-.412-2.188.293-2.954.466-.507 1.208-.582 1.856-.624a32.38 32.38 0 0 1 2.353-.07c1.65.013 3.322.193 4.872.796.076.03.152.06.227.092a5.58 5.58 0 0 0-1.53.535m7.572 5.463a4.268 4.268 0 0 0-.076-.28c.163-.4.275-.815.324-1.235.194-.217.245-.582.085-.83l-.085-.127a4.01 4.01 0 0 0-.077-.414c.338.42.566.92.567 1.459.003.603-.298 1.091-.738 1.427m-15.71-.187c.01-.016.023-.031.034-.047 1.132 1.546 2.716 2.741 4.508 3.48.704.289 1.451.506 2.217.64.023.022.047.042.072.062-1.65-.033-3.29-.42-4.736-1.214a8.45 8.45 0 0 1-2.556-2.187c.14-.25.293-.495.46-.734m-1.094-2.07c.105.262.224.516.352.765a10.42 10.42 0 0 0-.56.766 9.434 9.434 0 0 1-.984-2.695c.214-.551.459-1.09.731-1.614-.085.94.116 1.918.46 2.777m5.85-2.706a9.601 9.601 0 0 0-2.614 1.015c.421-.472.98-.845 1.596-1.04a3.516 3.516 0 0 1 1.602-.128 5.682 5.682 0 0 0-.583.153m-.68 5.678.042.033c-.794-.238-1.522-.635-2.087-1.251-.356-.388-.554-.807-.625-1.228.32-.276.661-.529 1.018-.754-.137 1.242.692 2.412 1.652 3.2m2.3-4.47.075-.003a3.29 3.29 0 0 0-.333 1.646c.021.362.097.713.22 1.04a4.44 4.44 0 0 0-.435 1.364l-.104-.067c-.846-.57-2.514-1.771-1.819-2.992.217-.381.575-.632.99-.793.46-.108.93-.174 1.406-.195m6.486 2.883a4.976 4.976 0 0 0-.202-.707c.184.156.363.32.534.49-.11.074-.22.146-.332.217m.574 1.32.236-.148c-.043.057-.086.114-.13.169l-.106-.022m-3.479 1.838a15.047 15.047 0 0 1-.503-.18c.236-.056.47-.12.703-.19a1.69 1.69 0 0 1-.2.37m-.132-3.42c.217.477.389.988.464 1.499-.316.11-.637.207-.961.291.051-.39.143-.773.247-1.118.066-.222.15-.447.25-.673m-1.823.12c.114-.136.238-.264.371-.378-.07.174-.134.352-.191.531a1.248 1.248 0 0 1-.18-.152m.062-2.646c.166.159.325.325.475.497a5.06 5.06 0 0 0-.99.619c.023-.192.07-.378.14-.545.093-.215.222-.405.375-.571m-.713 3.945c.158.114.33.211.516.29a5.288 5.288 0 0 0-.03.376c-.178.024-.358.044-.541.06a2.25 2.25 0 0 1 .055-.726m-8.444 1.722c1 1.078 2.232 1.935 3.653 2.515 2.42.988 5.19 1.094 7.727.452.066.025.133.048.2.07-.448.326-.919.61-1.398.846-3.38 1.66-7.907 1.26-10.546-1.375a7.622 7.622 0 0 1 .364-2.508m-1.907.198a7.533 7.533 0 0 1-.216-.594 12.05 12.05 0 0 1 .212-2.544c.254.59.56 1.148.908 1.67a9.323 9.323 0 0 0-.633 2.041 6.692 6.692 0 0 1-.271-.573m5.425 6.461a10.463 10.463 0 0 1-3.17-1.074 8.166 8.166 0 0 1-.362-.948c.102.068.203.137.308.2 4.13 2.531 9.945 1.695 13.341-1.667a4.05 4.05 0 0 0 1.52-.62c.999.056 1.997.006 2.966-.174-1.555 1.602-3.644 2.67-5.754 3.353-2.798.906-5.92 1.43-8.85.93m16.697-1.845a14.46 14.46 0 0 1-2.36 2.269c-1.58.515-3.254.773-4.936.892-1.494.106-3.017.166-4.53.101l.12-.015c3.282-.447 6.654-1.486 9.308-3.525a11.565 11.565 0 0 0 2.726-2.97 6.608 6.608 0 0 0 2.246-1.905c-.476 1.877-1.338 3.653-2.574 5.153m1.343-15.154c.358.633.655 1.296.896 1.978-1.001-1.43-2.421-2.59-3.992-3.46-3.042-1.684-6.541-2.694-9.977-3.228.255-.099.512-.191.772-.278 1.698.305 3.358.717 4.896 1.105a93.712 93.712 0 0 1 5.811 1.669 12.806 12.806 0 0 1 1.594 2.214m5.444 4.913a9.848 9.848 0 0 1-.545 4.674c-1.174 2.12-2.635 4.136-4.53 5.662l.004-.007c1.82-2.546 2.737-5.701 2.715-8.82-.019-2.706-.758-5.378-2.185-7.665.265.129.526.266.782.415a7.536 7.536 0 0 1 3.003 3.213c.322.819.566 1.675.756 2.528m-31.245-4.52a8.394 8.394 0 0 1 2.995-2.864 24.142 24.142 0 0 0-1.51 2.32c-1.628 2.857-2.572 6.167-2.17 9.465l.002.02a19.705 19.705 0 0 1-1.087-5.149c.454-1.343 1.038-2.637 1.77-3.792m34.27 2.687c-.277-3.214-3.258-5.792-5.814-7.412a18.811 18.811 0 0 0-8.037-2.785c-.886-.527-1.8-.993-2.718-1.387-1.598-.685-3.264-1.005-4.995-.763-1.61.226-3.139.89-4.496 1.771-.339.22-.67.453-.995.698-.968.087-1.928.26-2.87.544-2.796.845-5.483 2.694-6.729 5.406-.718 1.564-.933 3.3-.838 5.043-1.038 3.28-1.758 6.961-.311 10.228 1.17 2.642 3.614 4.472 6.178 5.652 3.028 1.394 6.37 2.15 9.668 2.546 6.616.795 13.794-.707 18.075-6.19 1.912-2.448 2.917-5.407 2.735-8.514.687-1.516 1.292-3.156 1.147-4.837"/><path fill="#BBD9FD" d="M133.143 90.585c-17.053 0-43.956-.076-44.98-.127-1.162-.099-1.875-.276-2.472-.962-.688-.79-.725-1.703-.766-2.761-.198-4.996-.27-9.786-.232-15.099.011-1.478.01-3.325 0-5.648l-.003-.491.002-.076c.012-2.322.012-4.17.001-5.649-.039-5.312.034-10.102.23-15.074.043-1.082.08-1.994.768-2.785.594-.683 1.337-.865 2.5-.963 4.22-.357 17.087-.395 22.423-.395 5.28 0 9.727.033 11.625.064h.054a428.44 428.44 0 0 1 7.987-.066c6.67 0 11.804.113 13.732.303a3.8 3.8 0 0 1 1.292.335c.362.153.636.29.702.328.213.14.493.423.547 1.227.21 3.104.174 6.291.139 9.373-.02 1.678-.04 3.414-.02 5.128.032 2.853.01 5.736-.014 8.445.025 2.734.046 5.617.014 8.47-.02 1.715 0 3.45.02 5.129.035 3.081.071 6.268-.14 9.372-.053.805-.333 1.086-.57 1.242a9.36 9.36 0 0 1-.651.301 3.822 3.822 0 0 1-1.319.347c-.154.007-1.592.032-10.869.032"/><path fill="#3281EE" d="M130.288 39.113c-3.218 0-6.2.028-8.026.066a861.71 861.71 0 0 0-11.654-.065c-8.53 0-18.835.088-22.539.4-1.227.105-2.472.313-3.466 1.455-1.028 1.18-1.073 2.5-1.12 3.672-.202 5.148-.269 9.99-.23 15.142.01 1.598.008 3.541-.002 5.63h-.003l.002.292-.002.29h.004c.01 2.09.013 4.033.001 5.63-.038 5.154.029 9.995.231 15.143.047 1.172.092 2.493 1.12 3.673.994 1.142 2.239 1.35 3.466 1.454.666.056 28.932.13 45.08.13 6.28 0 10.723-.012 11.004-.04.894-.087 1.366-.294 1.74-.452.39-.166.763-.348.88-.424.677-.444 1.139-1.17 1.218-2.35.329-4.856.067-9.72.123-14.58.03-2.827.011-5.65-.014-8.474.025-2.824.045-5.648.014-8.474-.056-4.861.206-9.724-.123-14.581-.08-1.18-.541-1.906-1.219-2.35-.116-.076-.488-.258-.88-.424-.373-.158-.845-.365-1.739-.453-2.361-.232-8.448-.31-13.866-.31m0 2.88c6.622 0 11.7.11 13.582.296.435.043.6.113.87.228l.03.012c.124.052.236.103.325.145.007.042.015.098.02.17.206 3.048.171 6.067.135 9.263-.019 1.685-.039 3.427-.02 5.156.032 2.843.011 5.717-.013 8.416v.051c.024 2.7.045 5.573.014 8.416-.02 1.73 0 3.472.02 5.156.035 3.196.07 6.215-.137 9.264a1.55 1.55 0 0 1-.019.17c-.091.042-.204.093-.325.144l-.03.013c-.258.11-.419.177-.808.22-.35.01-2.14.031-10.783.031-16.658 0-43.25-.073-44.889-.123-.993-.088-1.262-.217-1.482-.47-.323-.371-.372-.832-.413-1.872l-.001-.024c-.195-4.95-.268-9.718-.229-15.008.01-1.497.01-3.35-.001-5.666 0-.035 0-.069-.002-.103v-.347l.002-.103c.012-2.315.012-4.169.001-5.665-.039-5.29.034-10.06.229-15.008v-.024c.042-1.04.091-1.502.414-1.873.224-.256.498-.386 1.534-.474 2.933-.247 11.06-.39 22.296-.39 5.276 0 9.715.034 11.607.065h.108a425.92 425.92 0 0 1 7.965-.066"/><path fill="#3281EE" d="M148.152 50.169s.008-5.014-.161-7.52c-.08-1.178-.542-1.905-1.22-2.35a7.737 7.737 0 0 0-.879-.423c-.373-.158-.845-.365-1.739-.453-3.76-.37-16.992-.347-21.89-.244-5.367-.088-28.258-.166-34.195.336-1.226.104-2.471.311-3.466 1.453-1.027 1.18-1.072 2.502-1.119 3.673-.073 1.874-.168 5.53-.168 5.53l64.838-.002z"/><path fill="#BBD9FD" d="M144.672 44.606c-.098-.488-.431-.94-.717-1.137-.78-.538-1.958-.427-2.53.34-.577.772-.727 2.022.462 2.784 1.012.648 2.334.035 2.714-1.056a1.81 1.81 0 0 0 .07-.931m-5.864 0c-.098-.488-.432-.94-.717-1.137-.78-.538-1.958-.427-2.53.34-.577.772-.727 2.022.462 2.784 1.012.648 2.333.035 2.714-1.056a1.81 1.81 0 0 0 .07-.931m-5.864 0c-.098-.488-.432-.94-.718-1.137-.78-.538-1.957-.427-2.53.34-.577.772-.726 2.022.463 2.784 1.012.648 2.333.035 2.713-1.056a1.81 1.81 0 0 0 .072-.931"/><path fill="#3281EE" d="M101.342 68.116c-.165 0-.396-.044-.733-.38-.357-.356-1.173-1.582-.279-2.512.129-.134.913-.86 1.067-.995l.707-.62-.642-.686a10.883 10.883 0 0 0-1.04-.997c-.3-.247-.377-.612-.39-.874-.022-.475.157-.976.456-1.274a1.4 1.4 0 0 1 1.017-.44c.42 0 .867.177 1.257.498.274.226.523.476.742.713l-.003.027.444.467.441.484s.73-.418 1.77-1.86c.255-.351.646-.461 1.007-.461.614 0 1.258.455 1.532 1.082.124.285.187.799-.096 1.166-.386.5-1.04 1.349-1.466 1.796l-.602.573.894.748c.19.159.37.308.536.465.472.439.601.93.391 1.462-.256.653-.95 1.145-1.615 1.145-.368 0-.714-.148-1.026-.44a25.47 25.47 0 0 0-.85-.745l-.603-.509-.59.522a6.659 6.659 0 0 0-.655.692c-.3.35-.81 1.143-1.671.953m22.061 0c-.164 0-.396-.044-.733-.38-.357-.356-1.173-1.582-.279-2.512.129-.134.913-.86 1.067-.995l.707-.62-.642-.686a10.883 10.883 0 0 0-1.04-.997c-.299-.247-.377-.612-.39-.874-.022-.475.156-.976.455-1.274.292-.292.634-.44 1.018-.44.42 0 .867.177 1.256.498.275.226.524.476.743.713l-.002.027.444.467.44.484s.73-.418 1.77-1.86c.255-.351.646-.461 1.007-.461.614 0 1.258.455 1.532 1.082.125.285.188.799-.096 1.166-.385.5-1.04 1.349-1.466 1.796l-.602.573.893.748c.192.159.371.308.536.465.473.439.603.93.393 1.462-.257.653-.951 1.145-1.615 1.145-.369 0-.714-.148-1.028-.44-.291-.27-.591-.527-.85-.745l-.602-.509-.59.522a6.659 6.659 0 0 0-.655.692c-.3.35-.81 1.143-1.671.953m-1.689 8.879c-5.019-.528-5.018-.826-10.035-1.554-2.066-.298-2.484 2.914-.413 3.214 5.016.729 5.016 1.026 10.037 1.554 2.07.219 2.496-2.995.411-3.214"/></g></svg>',
    title: t('screens.cozyNotFound.title'),
    body: t('screens.cozyNotFound.body'),
    footer: true,
    header: true
  })
